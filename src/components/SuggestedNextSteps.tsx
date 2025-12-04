import type { SuggestedNextStepsMessage } from '../services/api';

interface SuggestedNextStepsProps {
  nextSteps: SuggestedNextStepsMessage | null;
}

export default function SuggestedNextSteps({ nextSteps }: SuggestedNextStepsProps) {
  if (!nextSteps || !nextSteps.steps || nextSteps.steps.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Suggested Next Steps</h3>
        <p className="text-sm text-gray-500">Actionable steps will appear here as you chat...</p>
      </div>
    );
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Suggested Next Steps</h3>
        {nextSteps.priority && (
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(nextSteps.priority)}`}
          >
            {nextSteps.priority} Priority
          </span>
        )}
      </div>

      <ul className="space-y-2">
        {nextSteps.steps.map((step, index) => (
          <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
            <span className="text-blue-500 mt-1 flex-shrink-0">•</span>
            <span>{step}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

