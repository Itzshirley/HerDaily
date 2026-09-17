import IconBadge from "./IconBadge";

function StatCard({ icon, iconBg, iconColor, label, value, delta }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-5 flex flex-col gap-3">
      <IconBadge icon={icon} bg={iconBg} color={iconColor} />
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-800 leading-tight">{value}</p>
        {delta && (
          <p className="text-xs text-emerald-500 font-semibold mt-0.5">{delta}</p>
        )}
      </div>
    </div>
  );
}

export default StatCard;
