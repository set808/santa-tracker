export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="relative">
        {/* Outer ring */}
        <div className="w-16 h-16 border-4 border-christmas-gold/20 rounded-full"></div>

        {/* Spinning ring */}
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-christmas-gold border-r-christmas-gold rounded-full animate-spin"></div>

        {/* Christmas star in center */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-christmas-gold text-2xl animate-twinkle">
          ⭐
        </div>
      </div>
    </div>
  );
}
