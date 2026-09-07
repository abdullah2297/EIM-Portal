import AccountBalance from '@mui/icons-material/AccountBalance';
import AccountTree from '@mui/icons-material/AccountTree';
import Add from '@mui/icons-material/Add';
import ArrowBack from '@mui/icons-material/ArrowBack';
import ArrowForward from '@mui/icons-material/ArrowForward';
import AutoStories from '@mui/icons-material/AutoStories';
import Badge from '@mui/icons-material/Badge';
import BusinessCenter from '@mui/icons-material/BusinessCenter';
import CalendarMonth from '@mui/icons-material/CalendarMonth';
import Campaign from '@mui/icons-material/Campaign';
import Cancel from '@mui/icons-material/Cancel';
import Celebration from '@mui/icons-material/Celebration';
import CheckCircle from '@mui/icons-material/CheckCircle';
import ChevronRight from '@mui/icons-material/ChevronRight';
import Close from '@mui/icons-material/Close';
import ContactSupport from '@mui/icons-material/ContactSupport';
import ContentCopy from '@mui/icons-material/ContentCopy';
import Dashboard from '@mui/icons-material/Dashboard';
import Delete from '@mui/icons-material/Delete';
import Diamond from '@mui/icons-material/Diamond';
import Dns from '@mui/icons-material/Dns';
import Edit from '@mui/icons-material/Edit';
import EmojiEvents from '@mui/icons-material/EmojiEvents';
import Engineering from '@mui/icons-material/Engineering';
import ErrorOutline from '@mui/icons-material/ErrorOutline';
import Event from '@mui/icons-material/Event';
import ExpandMore from '@mui/icons-material/ExpandMore';
import FactCheck from '@mui/icons-material/FactCheck';
import FilterList from '@mui/icons-material/FilterList';
import Flag from '@mui/icons-material/Flag';
import Groups from '@mui/icons-material/Groups';
import Handshake from '@mui/icons-material/Handshake';
import Home from '@mui/icons-material/Home';
import Hub from '@mui/icons-material/Hub';
import Inbox from '@mui/icons-material/Inbox';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import InsertChart from '@mui/icons-material/InsertChart';
import Insights from '@mui/icons-material/Insights';
import Language from '@mui/icons-material/Language';
import Lightbulb from '@mui/icons-material/Lightbulb';
import LocationOn from '@mui/icons-material/LocationOn';
import Login from '@mui/icons-material/Login';
import Logout from '@mui/icons-material/Logout';
import MailOutline from '@mui/icons-material/MailOutline';
import Menu from '@mui/icons-material/Menu';
import MilitaryTech from '@mui/icons-material/MilitaryTech';
import MoreHoriz from '@mui/icons-material/MoreHoriz';
import NightsStay from '@mui/icons-material/NightsStay';
import OpenInNew from '@mui/icons-material/OpenInNew';
import Person from '@mui/icons-material/Person';
import PhotoLibrary from '@mui/icons-material/PhotoLibrary';
import Psychology from '@mui/icons-material/Psychology';
import Publish from '@mui/icons-material/Publish';
import RocketLaunch from '@mui/icons-material/RocketLaunch';
import Save from '@mui/icons-material/Save';
import Schedule from '@mui/icons-material/Schedule';
import School from '@mui/icons-material/School';
import Search from '@mui/icons-material/Search';
import SearchOff from '@mui/icons-material/SearchOff';
import Settings from '@mui/icons-material/Settings';
import SportsEsports from '@mui/icons-material/SportsEsports';
import Star from '@mui/icons-material/Star';
import SupportAgent from '@mui/icons-material/SupportAgent';
import Timeline from '@mui/icons-material/Timeline';
import TipsAndUpdates from '@mui/icons-material/TipsAndUpdates';
import TrendingUp from '@mui/icons-material/TrendingUp';
import Verified from '@mui/icons-material/Verified';
import VerifiedUser from '@mui/icons-material/VerifiedUser';
import Visibility from '@mui/icons-material/Visibility';
import Work from '@mui/icons-material/Work';
import WorkHistory from '@mui/icons-material/WorkHistory';
import WorkspacePremium from '@mui/icons-material/WorkspacePremium';
import LightMode from '@mui/icons-material/LightMode';
import DarkMode from '@mui/icons-material/DarkMode';
import Favorite from '@mui/icons-material/Favorite';
import Interests from '@mui/icons-material/Interests';
import SportsSoccer from '@mui/icons-material/SportsSoccer';
import Bolt from '@mui/icons-material/Bolt';
import Description from '@mui/icons-material/Description';
import AttachFile from '@mui/icons-material/AttachFile';
import Leaderboard from '@mui/icons-material/Leaderboard';
import HowToReg from '@mui/icons-material/HowToReg';
import Gavel from '@mui/icons-material/Gavel';
import CardGiftcard from '@mui/icons-material/CardGiftcard';
import Refresh from '@mui/icons-material/Refresh';
import Storage from '@mui/icons-material/Storage';
import UploadFile from '@mui/icons-material/UploadFile';
import FolderZip from '@mui/icons-material/FolderZip';
import MenuBook from '@mui/icons-material/MenuBook';
import Category from '@mui/icons-material/Category';
import Quiz from '@mui/icons-material/Quiz';
import VideoCameraFront from '@mui/icons-material/VideoCameraFront';
import LaptopMac from '@mui/icons-material/LaptopMac';

/**
 * Curated Material Icons registry.
 *
 * Icons are referenced by name from data files and config (e.g. a team's
 * `icon` field). Importing an explicit set keeps the bundle small and means an
 * unknown name degrades to a sensible default instead of crashing.
 */
const ICONS = {
  AccountBalance, AccountTree, Add, ArrowBack, ArrowForward, AttachFile, AutoStories,
  Badge, Bolt, BusinessCenter, CalendarMonth, Campaign, Cancel, CardGiftcard, Category, Celebration,
  CheckCircle, ChevronRight, Close, ContactSupport, ContentCopy, DarkMode, Dashboard,
  Delete, Description, Diamond, Dns, Edit, EmojiEvents, Engineering, ErrorOutline, Event,
  ExpandMore, FactCheck, Favorite, FilterList, Flag, FolderZip, Gavel, Groups, Handshake, Home,
  HowToReg, Hub, Inbox, InfoOutlined, InsertChart, Insights, Interests, LaptopMac, Language,
  Leaderboard, Lightbulb, LightMode, LocationOn, Login, Logout, MailOutline, Menu, MenuBook,
  MilitaryTech, MoreHoriz, NightsStay, OpenInNew, Person, PhotoLibrary, Psychology, Quiz,
  Publish, Refresh, RocketLaunch, Save, Schedule, School, Search, SearchOff, Settings,
  SportsEsports, SportsSoccer, Star, Storage, SupportAgent, Timeline, TipsAndUpdates,
  TrendingUp, UploadFile, Verified, VerifiedUser, VideoCameraFront, Visibility, Work, WorkHistory, WorkspacePremium,
};

/**
 * @param {{ name: string, className?: string, fontSize?: 'inherit'|'small'|'medium'|'large', titleAccess?: string }} props
 */
export function Icon({ name, className, fontSize = 'small', titleAccess }) {
  const Component = ICONS[name] ?? InfoOutlined;
  return (
    <Component className={className} fontSize={fontSize} titleAccess={titleAccess} aria-hidden={!titleAccess} />
  );
}

export const ICON_NAMES = Object.keys(ICONS);

export default Icon;
