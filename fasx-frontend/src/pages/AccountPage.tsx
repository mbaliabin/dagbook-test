import { ProfileInfoCard } from "../components/AccountPage/ProfileInfoCard";

export default function AccountPage() {
  // ... логика загрузки profileData и hrZones ...

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 p-6 w-full font-sans">
      <div className="max-w-[1600px] mx-auto space-y-6 px-4">
        {/* HEADER И MENU ОСТАЮТСЯ ЗДЕСЬ */}
        <Header name={name} />
        <NavigationMenu />

        {/* ИСПОЛЬЗУЕМ НОВЫЙ КОМПОНЕНТ */}
        <div className="max-w-[1000px] mx-auto pt-4 space-y-6">
          <ProfileInfoCard
            profileData={profile}
            hrZones={hrZones}
            isEditing={isEditing}
            onEditToggle={() => setIsEditing(!isEditing)}
          />

          {/* Сюда можно добавить другие компоненты, например тренеров */}
          <TrainersList />
        </div>
      </div>
    </div>
  );
}