export const NavigationTabs = ({ activeTab, setActiveTab }) => {
  const tabs = ["List", "Board", "Dashboard", "Group Chat",  "Logs"];

  return (
    <div className="bg-wih-800 border-b border-wih-700">
      <div className="flex gap-6 px-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3 text-sm font-medium transition-colors relative ${activeTab === tab
                ? "text-wih-50"
                : "text-wih-400 hover:text-wih-50"}`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-wih-50" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
