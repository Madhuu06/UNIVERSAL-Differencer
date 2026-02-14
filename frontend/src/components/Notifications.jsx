export function Notifications({ notifications, onRemove }) {
    if (notifications.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
            {notifications.map((notification) => (
                <div
                    key={notification.id}
                    className={`px-6 py-4 rounded-lg shadow-lg text-white animate-slide-in ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                        }`}
                >
                    <div className="flex items-start">
                        <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            {notification.type === 'success' ? (
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            ) : (
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            )}
                        </svg>
                        <div>
                            <p className="font-medium">{notification.type === 'success' ? 'Success' : 'Error'}</p>
                            <p className="text-sm opacity-90">{notification.message}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
