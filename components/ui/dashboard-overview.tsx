import React from 'react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils"; // Assumes shadcn's utility for class merging
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowUp, Minus, Files, FileText, Zap, BarChart3, Users, DollarSign, Clock, AlertCircle } from 'lucide-react';

// Define the icon type. Using React.ElementType for flexibility.
type IconType = React.ElementType | React.FunctionComponent<React.SVGProps<SVGSVGElement>>;

// Define trend types
export type TrendType = 'up' | 'down' | 'neutral';

// --- 📦 API (Props) Definition ---
export interface DashboardMetricCardProps {
  /** The main value of the metric (e.g., "1,234", "$5.6M", "92%"). */
  value: string;
  /** The descriptive title of the metric (e.g., "Total Users", "Revenue"). */
  title: string;
  /** Optional icon to display in the card header. */
  icon?: IconType;
  /** The percentage or absolute change for the trend (e.g., "2.5%"). */
  trendChange?: string;
  /** The direction of the trend ('up', 'down', 'neutral'). */
  trendType?: TrendType;
  /** Optional class name for the card container. */
  className?: string;
  /** Tailwind color class for the icon */
  iconColor?: string;
  /** Tailwind background color class for the icon container */
  iconBg?: string;
}

/**
 * A professional, animated metric card for admin dashboards.
 * Displays a key value, title, icon, and trend indicator with Framer Motion hover effects.
 */
export const DashboardMetricCard: React.FC<DashboardMetricCardProps> = ({
  value,
  title,
  icon: IconComponent,
  trendChange,
  trendType = 'neutral',
  className,
  iconColor,
  iconBg,
}) => {
  // Determine trend icon and color
  const TrendIcon = trendType === 'up' ? ArrowUp : trendType === 'down' ? ArrowDown : Minus;
  const trendColorClass =
    trendType === 'up'
      ? "text-green-600 dark:text-green-400"
      : trendType === 'down'
      ? "text-red-600 dark:text-red-400"
      : "text-muted-foreground";

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)" }} // Subtle lift and shadow on hover
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className={cn(
        "cursor-pointer rounded-lg", // Ensure cursor indicates interactivity
        className
      )}
    >
      <Card className="h-full transition-colors duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {IconComponent && (
            <div className={cn("p-2 rounded-full", iconBg || "bg-slate-100 dark:bg-slate-800")}>
              <IconComponent className={cn("h-4 w-4", iconColor || "text-slate-600 dark:text-slate-400")} aria-hidden="true" />
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground mb-2">{value}</div>
          {trendChange && (
            <p className={cn("flex items-center text-xs font-medium", trendColorClass)}>
              <TrendIcon className="h-3 w-3 mr-1" aria-hidden="true" />
              {trendChange} {trendType === 'up' ? "increase" : trendType === 'down' ? "decrease" : "change"}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};



interface DashboardOverviewProps {
  totalResumes?: number;
  totalCoverLetters?: number;
  totalReviews?: number;
  avgScore?: number;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  totalResumes = 0,
  totalCoverLetters = 0,
  totalReviews = 0,
  avgScore = 0
}) => {
  return (
    <div className="pt-8 w-full max-w-7xl mx-auto">
      <h3 className="text-xl font-semibold text-foreground mb-6">Dashboard Overview</h3>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardMetricCard
          title="Total Resumes"
          value={totalResumes.toString()}
          icon={Files}
          iconColor="text-blue-600 dark:text-blue-400"
          iconBg="bg-blue-100 dark:bg-blue-900/40"
          trendChange="+1"
          trendType="up"
        />
        <DashboardMetricCard
          title="Cover Letters"
          value={totalCoverLetters.toString()}
          icon={FileText}
          iconColor="text-violet-600 dark:text-violet-400"
          iconBg="bg-violet-100 dark:bg-violet-900/40"
          trendType="neutral"
        />
        <DashboardMetricCard
          title="AI Reviews"
          value={totalReviews.toString()}
          icon={Zap}
          iconColor="text-amber-500 dark:text-amber-400"
          iconBg="bg-amber-100 dark:bg-amber-900/40"
          trendType="neutral" 
        />
        <DashboardMetricCard
          title="Average Score"
          value={avgScore.toString()}
          icon={BarChart3} 
          iconColor="text-emerald-600 dark:text-emerald-400"
          iconBg="bg-emerald-100 dark:bg-emerald-900/40"
          trendType={avgScore >= 80 ? "up" : avgScore >= 50 ? "neutral" : "down"}
          className="lg:col-span-1" 
        />
      </div>
    </div>
  );
};

export default DashboardOverview;
