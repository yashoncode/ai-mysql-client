import React from 'react';

const InsightsPanel = ({ insights }) => {
  if (!insights) return null;

  return (
    <div className="bg-gray-800 rounded-xl p-4">
      <h3 className="text-purple-400 font-semibold mb-3">✨ AI Insights</h3>
      {insights.summary && (
        <p className="text-gray-300 text-sm mb-4">{insights.summary}</p>
      )}
      {insights.insights?.map((insight, i) => (
        <div key={i} className="flex gap-2 text-sm text-gray-300 mb-1">
          <span className="text-green-400">•</span>
          {insight}
        </div>
      ))}
    </div>
  );
};

export default InsightsPanel;
