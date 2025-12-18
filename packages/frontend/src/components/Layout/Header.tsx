export default function Header() {
  return (
    <header className="bg-christmas-darkGreen border-b-4 border-christmas-gold shadow-xl">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-4">
            <div className="text-5xl animate-sleigh-move">🎅</div>
            <div>
              <h1 className="text-4xl font-christmas text-christmas-gold tracking-wider">
                Santa Tracker
              </h1>
              <p className="text-christmas-snow text-sm mt-1">
                Real-time Christmas Eve Operations Dashboard
              </p>
            </div>
          </div>

          {/* New Relic Branding */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-gray-400">Powered by</p>
              <p className="text-lg font-bold text-newrelic-green">New Relic</p>
            </div>
            <div className="w-12 h-12 bg-newrelic-green rounded-lg flex items-center justify-center font-bold text-gray-900 text-xl shadow-lg">
              NR
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="mt-4 flex items-center gap-2 text-2xl">
          <span className="animate-twinkle">⭐</span>
          <div className="flex-1 h-0.5 bg-gradient-to-r from-christmas-gold via-christmas-red to-christmas-gold"></div>
          <span className="animate-twinkle animation-delay-300">🎄</span>
          <div className="flex-1 h-0.5 bg-gradient-to-r from-christmas-gold via-christmas-red to-christmas-gold"></div>
          <span className="animate-twinkle animation-delay-600">⭐</span>
        </div>
      </div>
    </header>
  );
}
