import type { ReactElement } from "react";
import type { AppKey, CaseConfig } from "../../types/case";
import Messages from "./Messages/Messages";
import Photos from "./Photos/Photos";
import Settings from "./Settings/Settings";
import Tinder from "./Tinder/Tinder";
import Notes from "./Notes/Notes";
import Calendar from "./Calendar/Calendar";
import Instagram from "./Instagram/Instagram";
import Gmail from "./Gmail/Gmail";
import Airbnb from "./Airbnb/Airbnb";
import WhatsApp from "./WhatsApp/WhatsApp";
import Phone from "./Phone/Phone";
import Weather from "./Weather/Weather";
import Wallet from "./Wallet/Wallet";
import Revolut from "./Revolut/Revolut";
import Clock from "./Clock/Clock";
import Compass from "./Compass/Compass";
import Calculator from "./Calculator/Calculator";
import Chrome from "./Chrome/Chrome";
import Maps from "./Maps/Maps";
import Decoy from "./Decoy/Decoy";

export interface AppComponentProps {
  caseData: CaseConfig;
  onBack: () => void;
}

/**
 * Đăng ký app đã implement thật ở đây. App chưa có trong danh sách này
 * sẽ tự động render bằng <Decoy /> (xem renderApp bên dưới) — thêm app
 * mới = thêm 1 dòng vào đây, không phải sửa HomeScreen/PhoneFrame.
 */
const IMPLEMENTED_APPS: Partial<Record<AppKey, (props: AppComponentProps) => ReactElement>> = {
  messages: Messages,
  photos: Photos,
  settings: Settings,
  tinder: Tinder,
  notes: Notes,
  calendar: Calendar,
  instagram: Instagram,
  gmail: Gmail,
  airbnb: Airbnb,
  whatsapp: WhatsApp,
  phone: Phone,
  weather: Weather,
  wallet: Wallet,
  revolut: Revolut,
  clock: Clock,
  compass: Compass,
  calculator: Calculator,
  chrome: Chrome,
  maps: Maps,
};

export function renderApp(app: AppKey, label: string, props: AppComponentProps) {
  const Component = IMPLEMENTED_APPS[app];
  if (Component) return <Component {...props} />;
  return <Decoy title={label} onBack={props.onBack} />;
}
