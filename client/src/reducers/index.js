import Auth from "./Auth";
import SocketReducer from "./SocketReducer";
import ExchangeReducer from "./Exchange";
import ArbitrageReducer from "./ArbitrageReducer";
import AdminReducer from "./AdminReducer";
import AdminProfileReducer from "./AdminProfileReducer";
import DailyStatsReducer from "./DailyStatsReducer";
import LiquidityBotReducer from "./LiquidityBotReducer";
import ManageKeysReducer from "./ManageKeysReducer";

export default {
  auth: Auth,
  socketReducer: SocketReducer,
  exchangeReducer: ExchangeReducer,
  arbitrageReducer: ArbitrageReducer,
  adminReducer: AdminReducer,
  adminProfileReducer: AdminProfileReducer,
  dailyStatsReducer: DailyStatsReducer,
  LiquidityBotReducer: LiquidityBotReducer,
  ManageKeysReducer: ManageKeysReducer,
};
