import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, GraduationCap, Calendar } from "lucide-react";

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  isPaid: boolean;
  price: number;
  coverImage: string;
  enrolled?: boolean;
  subject?: string;
  semester?: string;
  year?: number;
}

const CourseCard = ({
  id,
  title,
  description,
  isPaid,
  price,
  coverImage,
  enrolled = false,
  subject,
  semester,
  year,
}: CourseCardProps) => {
  return (
    <Card className="overflow-hidden flex flex-col h-full border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-800 transition-all hover:shadow-md">
      <div className="relative h-48 overflow-hidden">
        <img
          src={coverImage || "/placeholder.svg"}
          alt={title}
          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder.svg";
          }}
        />
        <div className="absolute top-3 right-3 flex gap-2">
          {isPaid ? (
            <Badge className="bg-gradient-to-r from-amber-500 to-amber-600">Premium</Badge>
          ) : (
            <Badge className="bg-gradient-to-r from-green-500 to-green-600">Free</Badge>
          )}
          {subject && (
            <Badge variant="outline" className="bg-white/80 dark:bg-gray-900/80">
              {subject}
            </Badge>
          )}
        </div>
      </div>
      <CardContent className="pt-4 flex-grow">
        <h3 className="text-xl font-semibold mb-2 line-clamp-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-3">
          {description}
        </p>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>12 Lessons</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>6 Hours</span>
          </div>
          {semester && (
            <div className="flex items-center gap-1">
              <GraduationCap className="h-4 w-4" />
              <span>{semester}</span>
            </div>
          )}
          {year && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{year}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        {enrolled ? (
          <Link to={`/courses/${id}`} className="w-full">
            <Button variant="outline" className="w-full">
              Continue Learning
            </Button>
          </Link>
        ) : isPaid ? (
          <div className="w-full flex justify-between items-center">
            <span className="font-semibold text-lg">${price}</span>
            <Link to={`/courses/${id}`}>
              <Button>Enroll Now</Button>
            </Link>
          </div>
        ) : (
          <Link to={`/courses/${id}`} className="w-full">
            <Button className="w-full">Start Learning</Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
};

export default CourseCard;
