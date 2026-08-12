import React from "react";

interface MetricCardProps {
  title: string;
  value: string;
  caption: string;
  icon: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  caption,
  icon,
}) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="flex items-center justify-center w-12 h-12 bg-brand-50 rounded-xl dark:bg-brand-500/10">
        <span className="text-brand-600 dark:text-brand-400">{icon}</span>
      </div>

      <div className="mt-5">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {title}
        </span>
        <h4 className="mt-2 font-bold text-gray-800 text-title-md dark:text-white/90">
          {value}
        </h4>
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
          {caption}
        </p>
      </div>
    </div>
  );
};

export default MetricCard;
