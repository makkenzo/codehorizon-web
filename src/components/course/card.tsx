import { Course } from '@/types';

interface CourseCardProps {
    course: Omit<Course, 'lessons'>;
}

const CourseCard = ({ course }: CourseCardProps) => {
    return (
        <div className="w-full">
            <h1>CourseCard</h1>
        </div>
    );
};

export default CourseCard;

