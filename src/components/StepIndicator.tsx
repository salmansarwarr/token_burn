"use client";

interface StepIndicatorProps {
    currentStep: number;
    steps: string[];
}

export function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
    return (
        <div className="w-full py-6">
            <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isActive = stepNumber === currentStep;
                    const isCompleted = stepNumber < currentStep;

                    return (
                        <div key={index} className="flex items-center flex-1">
                            {/* Step Circle */}
                            <div className="flex flex-col items-center">
                                <div
                                    className={`
                                        w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                                        transition-all duration-300
                                        ${
                                            isCompleted
                                                ? "bg-green-600 text-white"
                                                : isActive
                                                  ? "bg-blue-600 text-white ring-4 ring-blue-200 dark:ring-blue-800"
                                                  : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                                        }
                                    `}
                                >
                                    {isCompleted ? "✓" : stepNumber}
                                </div>
                                <div
                                    className={`
                                        mt-2 text-xs font-medium text-center max-w-[80px]
                                        ${
                                            isActive
                                                ? "text-blue-600 dark:text-blue-400"
                                                : isCompleted
                                                  ? "text-green-600 dark:text-green-400"
                                                  : "text-gray-500 dark:text-gray-400"
                                        }
                                    `}
                                >
                                    {step}
                                </div>
                            </div>

                            {/* Connector Line */}
                            {index < steps.length - 1 && (
                                <div
                                    className={`
                                        flex-1 h-1 mx-2 rounded-full transition-all duration-300
                                        ${
                                            isCompleted
                                                ? "bg-green-600"
                                                : "bg-gray-200 dark:bg-gray-700"
                                        }
                                    `}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
