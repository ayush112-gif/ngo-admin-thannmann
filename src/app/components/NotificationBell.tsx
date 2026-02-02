export default function NotificationBell() {
  return (
    <div className="relative cursor-pointer">
      🔔
      <span className="absolute -top-2 -right-2 bg-red-500 text-xs px-2 rounded-full">
        3
      </span>
    </div>
  );
}
