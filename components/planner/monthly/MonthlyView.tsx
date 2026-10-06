import BalanceCard from "./BalanceCard";
import MonthlyKpis from "./MonthlyKpis";
import MonthTable from "./MonthTable";
import SavedEachMonthCard from "./SavedEachMonthCard";
import YearAtAGlance from "./YearAtAGlance";

export default function MonthlyView() {
  return (
    <div className="mm">
      <MonthlyKpis />
      <div className="cards">
        <div className="mrow">
          <SavedEachMonthCard />
          <BalanceCard />
        </div>
        <YearAtAGlance />
      </div>
      <MonthTable />
    </div>
  );
}
