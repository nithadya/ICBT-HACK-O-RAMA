import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase';
import { analyzeContent } from '@/lib/openai';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import {
  Loader2,
  AlertTriangle,
  Flag,
  Users,
  BookOpen,
  FileText,
  Brain,
  Shield,
  TrendingUp,
  Activity,
  AlertCircle,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface FlaggedContent {
  id: string;
  type: string;
  content: string;
  reason: string;
  status: string;
  reported_by: string;
  created_at: string;
  content_id: string;
  course_id?: string;
  ai_analysis?: {
    category: string;
    confidence: number;
    explanation: string;
  };
}

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    users: { total: 0, active: 0, new: 0 },
    content: { courses: 0, notes: 0, discussions: 0 },
    moderation: { pending: 0, approved: 0, rejected: 0 },
    ai: { accuracy: 0, latency: 0, flagged: 0 }
  });
  const [flaggedContent, setFlaggedContent] = useState<FlaggedContent[]>([]);
  const [chartData, setChartData] = useState({
    userActivity: {
      labels: [],
      datasets: [],
    },
    contentGrowth: {
      labels: [],
      datasets: [],
    },
    moderationMetrics: {
      labels: [],
      datasets: [],
    },
    aiPerformance: {
      labels: [],
      datasets: [],
    }
  });

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (!session) {
          console.error('No session found');
          navigate('/auth');
          return;
        }

        // Get user metadata to check role
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (userError) throw userError;

        // Debug log
        console.log('User role:', session.user.role);
        console.log('User metadata:', session.user.user_metadata);
        
        if (!isAdmin) {
          console.error('User is not an admin');
          navigate('/app');
          return;
        }

        fetchDashboardData();
      } catch (error) {
        console.error('Error checking admin access:', error);
        navigate('/app');
      }
    };

    checkAdminAccess();
  }, [isAdmin, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Debug log the current session
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Current session:', session);
      
      // First, fetch basic flagged content
      const { data: flaggedData, error: flaggedError } = await supabase
        .from('flagged_content')
        .select('*')
        .order('created_at', { ascending: false });

      if (flaggedError) {
        console.error('Error fetching flagged content:', flaggedError);
        throw flaggedError;
      }

      // Then fetch associated notes data
      const notesPromises = flaggedData?.map(async (item) => {
        if (item.type === 'notes') {
          const { data: noteData } = await supabase
            .from('notes')
            .select('title, content')
            .eq('id', item.content_id)
            .single();
          return { ...item, note: noteData };
        }
        return item;
      }) || [];

      const contentWithNotes = await Promise.all(notesPromises);

      // Fetch user data for reported_by
      const userPromises = contentWithNotes.map(async (item) => {
        if (item.reported_by) {
          const { data: userData } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', item.reported_by)
            .single();
          return { ...item, reporter: userData };
        }
        return item;
      });

      const processedContent = await Promise.all(userPromises);

      // Analyze unanalyzed content
      const analyzedContent = await Promise.all(processedContent.map(async (item) => {
        if (!item.ai_analysis) {
          try {
            setAnalyzing(item.id);
            const result = await analyzeContent(item.content);
            
            // Update the flagged content with AI analysis
            await supabase
              .from('flagged_content')
              .update({
                ai_analysis: {
                  category: result.category,
                  confidence: result.confidence,
                  explanation: result.explanation
                }
              })
              .eq('id', item.id);

            return {
              ...item,
              ai_analysis: {
                category: result.category,
                confidence: result.confidence,
                explanation: result.explanation
              }
            };
          } catch (error) {
            console.error('Error analyzing content:', error);
            return item;
          } finally {
            setAnalyzing(null);
          }
        }
        return item;
      }));

      setFlaggedContent(analyzedContent);

      // Calculate stats from the processed data
      const pending = analyzedContent.filter(f => f.status === 'pending').length;
      const approved = analyzedContent.filter(f => f.status === 'approved').length;
      const rejected = analyzedContent.filter(f => f.status === 'rejected').length;

      setStats(prev => ({
        ...prev,
        moderation: {
          pending,
          approved,
          rejected
        },
        ai: {
          accuracy: 92,
          latency: 0.8,
          flagged: analyzedContent.length
        }
      }));

      // Update charts
      updateChartData();
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch dashboard data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateChartData = () => {
    setChartData({
      userActivity: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Active Users',
          data: [150, 180, 210, 190, 220, 170, 160],
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      contentGrowth: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Content Items',
          data: [300, 450, 600, 800, 950, 1200],
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)'
          ]
        }]
      },
      moderationMetrics: {
        labels: ['Spam', 'Plagiarism', 'Inappropriate', 'Academic Dishonesty'],
        datasets: [{
          label: 'Detection Rate',
          data: [95, 88, 92, 90],
          backgroundColor: 'rgba(139, 92, 246, 0.5)',
          borderColor: 'rgba(139, 92, 246, 1)',
          borderWidth: 1
        }]
      },
      aiPerformance: {
        labels: ['Accuracy', 'Precision', 'Recall', 'F1 Score'],
        datasets: [{
          label: 'AI Metrics',
          data: [92, 89, 94, 91],
          backgroundColor: 'rgba(244, 63, 94, 0.2)',
          borderColor: 'rgba(244, 63, 94, 1)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(244, 63, 94, 1)'
        }]
      }
    });
  };

  const handleContentAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      const content = flaggedContent.find(f => f.id === id);
      if (!content) return;

      // Update content status
      const { error: updateError } = await supabase
        .from('flagged_content')
        .update({
          status: action,
          resolved_at: new Date().toISOString(),
          resolved_by: user?.id
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // If rejecting, remove or hide the original content
      if (action === 'reject') {
        const { error: contentError } = await supabase
          .from(content.type)
          .update({ is_hidden: true })
          .eq('id', content.content_id);

        if (contentError) throw contentError;
      }

      // Update local state
      setFlaggedContent(prev =>
        prev.map(f =>
          f.id === id
            ? { ...f, status: action }
            : f
        )
      );

      toast({
        title: 'Success',
        description: `Content has been ${action}ed`,
      });
    } catch (error) {
      console.error(`Error ${action}ing content:`, error);
      toast({
        title: 'Error',
        description: `Failed to ${action} content`,
        variant: 'destructive',
      });
    }
  };

  const analyzeContentWithAI = async (id: string, content: string) => {
    try {
      setAnalyzing(id);
      const analysis = await analyzeContent(content);
      
      setFlaggedContent(prev =>
        prev.map(item =>
          item.id === id
            ? {
                ...item,
                ai_analysis: {
                  category: analysis.category,
                  confidence: analysis.confidence,
                  explanation: analysis.explanation
                }
              }
            : item
        )
      );

      toast({
        title: 'AI Analysis Complete',
        description: 'Content has been analyzed successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to analyze content',
        variant: 'destructive',
      });
    } finally {
      setAnalyzing(null);
    }
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            family: 'system-ui',
            size: 12
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="moderation">
            Moderation
            {stats.moderation.pending > 0 && (
              <Badge variant="destructive" className="ml-2">
                {stats.moderation.pending}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-500">{stats.users.total}</div>
                <div className="text-sm text-blue-300">
                  {stats.users.active} active users
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-green-500" />
                  Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">
                  {stats.content.courses + stats.content.notes}
                </div>
                <div className="text-sm text-green-300">
                  {stats.content.courses} courses, {stats.content.notes} notes
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-500" />
                  Moderation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-500">
                  {stats.moderation.pending}
                </div>
                <div className="text-sm text-purple-300">
                  Pending reviews
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-500/10 to-red-600/10 border-red-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-red-500" />
                  AI Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-500">
                  {stats.ai.accuracy}%
                </div>
                <div className="text-sm text-red-300">
                  Detection accuracy
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <Line data={chartData.userActivity} options={chartOptions} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <Bar data={chartData.contentGrowth} options={chartOptions} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="moderation" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  Pending Review
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.moderation.pending}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Approved
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.moderation.approved}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  Rejected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.moderation.rejected}</div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {flaggedContent.map((content) => (
              <Card key={content.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        content.status === 'pending' ? 'default' :
                        content.status === 'approved' ? 'success' : 'destructive'
                      }>
                        {content.status.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">{content.type.toUpperCase()}</Badge>
                      {content.ai_analysis && (
                        <Badge variant={
                          content.ai_analysis.confidence > 0.8 ? 'destructive' :
                          content.ai_analysis.confidence > 0.5 ? 'warning' : 'default'
                        }>
                          {content.ai_analysis.category}
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold">
                      {content.type === 'notes' && content.notes?.title}
                      {content.type === 'courses' && content.courses?.title}
                      {!content.notes?.title && !content.courses?.title && 'Untitled Content'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">{content.content}</p>
                    {content.ai_analysis && (
                      <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <h4 className="font-semibold mb-2">AI Analysis</h4>
                        <p className="text-sm">{content.ai_analysis.explanation}</p>
                        <div className="mt-2">
                          <div className="text-sm text-gray-500">Confidence</div>
                          <Progress value={content.ai_analysis.confidence * 100} className="mt-1" />
                        </div>
                      </div>
                    )}
                    <div className="mt-4 text-sm text-gray-500">
                      <p>Reported by: {content.profiles?.email || 'Unknown'}</p>
                      <p>Reason: {content.reason}</p>
                      <p>Date: {new Date(content.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  {content.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="text-green-600"
                        onClick={() => handleContentAction(content.id, 'approve')}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        className="text-red-600"
                        onClick={() => handleContentAction(content.id, 'reject')}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard; 