import React, { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "cashApp_v2";

export default function App() {
  const [startBalanceInput, setStartBalanceInput] = useState("100000");
  const [appliedStartBalance, setAppliedStartBalance] = useState(100000);

  const [rows, setRows] = useState([]);
  const [plans, setPlans] = useState([]);

  const [date, setDate] = useState("");
  const [text, setText] = useState("");
  const [inVal, setInVal] = useState("");
  const [outVal, setOutVal] = useState("");

  const [planDate, setPlanDate] = useState("");
  const [planText, setPlanText] = useState("");
  const [planInVal, setPlanInVal] = useState("");
  const [planOutVal, setPlanOutVal] = useState("");

  const [editIndex, setEditIndex] = useState(-1);
  const [editPlanIndex, setEditPlanIndex] = useState(-1);

  const toNumber = (v) => {
    const n = Number(String(v).replace(/,/g, ""));
    return Number.isFinite(n) ? n : 0;
  };

  const normalizeDate = (v) => {
    if (!v) return "";
    return String(v).slice(0, 10);
  };

  // 初回読み込み
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const data = JSON.parse(raw);

      const savedStartBalance = Number(data.appliedStartBalance ?? 100000);
      setAppliedStartBalance(savedStartBalance);
      setStartBalanceInput(String(savedStartBalance));

      setRows(Array.isArray(data.rows) ? data.rows : []);
      setPlans(Array.isArray(data.plans) ? data.plans : []);
    } catch (e) {
      console.error("保存データ読み込み失敗", e);
    }
  }, []);

  // 自動保存
  useEffect(() => {
    const payload = {
      appliedStartBalance,
      rows,
      plans,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [appliedStartBalance, rows, plans]);

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) =>
      normalizeDate(a.date).localeCompare(normalizeDate(b.date))
    );
  }, [rows]);

  const calculatedRows = useMemo(() => {
    let running = appliedStartBalance;
    return sortedRows.map((item) => {
      running += toNumber(item.inMoney) - toNumber(item.outMoney);
      return {
        ...item,
        date: normalizeDate(item.date),
        balance: running,
      };
    });
  }, [sortedRows, appliedStartBalance]);

  const currentBalance =
    calculatedRows.length > 0
      ? calculatedRows[calculatedRows.length - 1].balance
      : appliedStartBalance;

  const sortedPlans = useMemo(() => {
    return [...plans].sort((a, b) =>
      normalizeDate(a.date).localeCompare(normalizeDate(b.date))
    );
  }, [plans]);

  const simulation = useMemo(() => {
    let future = currentBalance;
    return sortedPlans.map((item) => {
      future += toNumber(item.inMoney) - toNumber(item.outMoney);
      return {
        ...item,
        date: normalizeDate(item.date),
        balance: future,
      };
    });
  }, [sortedPlans, currentBalance]);

  const negative = simulation.find((x) => x.balance < 0);

  const resetRowForm = () => {
    setDate("");
    setText("");
    setInVal("");
    setOutVal("");
    setEditIndex(-1);
  };

  const resetPlanForm = () => {
    setPlanDate("");
    setPlanText("");
    setPlanInVal("");
    setPlanOutVal("");
    setEditPlanIndex(-1);
  };

  const handleApplyStartBalance = () => {
    setAppliedStartBalance(toNumber(startBalanceInput));
  };

  const addRow = () => {
    const item = {
      date: normalizeDate(date),
      text: text.trim(),
      inMoney: toNumber(inVal),
      outMoney: toNumber(outVal),
    };

    if (!item.date && !item.text && !item.inMoney && !item.outMoney) return;

    if (editIndex === -1) {
      setRows([...rows, item]);
    } else {
      const newRows = [...rows];
      newRows[editIndex] = item;
      setRows(newRows);
      setEditIndex(-1);
    }

    resetRowForm();
  };

  const editRow = (i) => {
    const item = sortedRows[i];

    const originalIndex = rows.findIndex(
      (r) =>
        normalizeDate(r.date) === normalizeDate(item.date) &&
        (r.text || "") === (item.text || "") &&
        toNumber(r.inMoney) === toNumber(item.inMoney) &&
        toNumber(r.outMoney) === toNumber(item.outMoney)
    );

    if (originalIndex === -1) return;

    setDate(normalizeDate(item.date));
    setText(item.text || "");
    setInVal(item.inMoney ? String(item.inMoney) : "");
    setOutVal(item.outMoney ? String(item.outMoney) : "");
    setEditIndex(originalIndex);
  };

  const deleteRow = (i) => {
    const item = sortedRows[i];

    const originalIndex = rows.findIndex(
      (r) =>
        normalizeDate(r.date) === normalizeDate(item.date) &&
        (r.text || "") === (item.text || "") &&
        toNumber(r.inMoney) === toNumber(item.inMoney) &&
        toNumber(r.outMoney) === toNumber(item.outMoney)
    );

    if (originalIndex === -1) return;

    setRows(rows.filter((_, idx) => idx !== originalIndex));
  };

  const addPlan = () => {
    const item = {
      date: normalizeDate(planDate),
      text: planText.trim(),
      inMoney: toNumber(planInVal),
      outMoney: toNumber(planOutVal),
    };

    if (!item.date && !item.text && !item.inMoney && !item.outMoney) return;

    if (editPlanIndex === -1) {
      setPlans([...plans, item]);
    } else {
      const newPlans = [...plans];
      newPlans[editPlanIndex] = item;
      setPlans(newPlans);
      setEditPlanIndex(-1);
    }

    resetPlanForm();
  };

  const editPlan = (i) => {
    const item = sortedPlans[i];

    const originalIndex = plans.findIndex(
      (r) =>
        normalizeDate(r.date) === normalizeDate(item.date) &&
        (r.text || "") === (item.text || "") &&
        toNumber(r.inMoney) === toNumber(item.inMoney) &&
        toNumber(r.outMoney) === toNumber(item.outMoney)
    );

    if (originalIndex === -1) return;

    setPlanDate(normalizeDate(item.date));
    setPlanText(item.text || "");
    setPlanInVal(item.inMoney ? String(item.inMoney) : "");
    setPlanOutVal(item.outMoney ? String(item.outMoney) : "");
    setEditPlanIndex(originalIndex);
  };

  const deletePlan = (i) => {
    const item = sortedPlans[i];

    const originalIndex = plans.findIndex(
      (r) =>
        normalizeDate(r.date) === normalizeDate(item.date) &&
        (r.text || "") === (item.text || "") &&
        toNumber(r.inMoney) === toNumber(item.inMoney) &&
        toNumber(r.outMoney) === toNumber(item.outMoney)
    );

    if (originalIndex === -1) return;

    setPlans(plans.filter((_, idx) => idx !== originalIndex));
  };

  const resetAll = () => {
    if (!window.confirm("リセットしますか？")) return;
    localStorage.removeItem(STORAGE_KEY);
    setStartBalanceInput("100000");
    setAppliedStartBalance(100000);
    setRows([]);
    setPlans([]);
    resetRowForm();
    resetPlanForm();
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial, Meiryo, sans-serif" }}>
      <h2>収支管理アプリ</h2>

      <div style={{ marginBottom: 12 }}>
        開始残高：
        <input
          style={{ marginLeft: 8, marginRight: 8 }}
          value={startBalanceInput}
          onChange={(e) => setStartBalanceInput(e.target.value)}
        />
        <button onClick={handleApplyStartBalance}>設定</button>
      </div>

      <h3>残高：{currentBalance}円</h3>

      <button onClick={resetAll}>初期化</button>

      <hr />

      <h3>収支入力</h3>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <br />
      <input
        placeholder="内容"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <br />
      <input
        placeholder="入金"
        value={inVal}
        onChange={(e) => setInVal(e.target.value)}
      />
      <br />
      <input
        placeholder="出金"
        value={outVal}
        onChange={(e) => setOutVal(e.target.value)}
      />
      <br />
      <button onClick={addRow}>{editIndex === -1 ? "追加" : "更新"}</button>
      {editIndex !== -1 && (
        <button onClick={resetRowForm} style={{ marginLeft: 8 }}>
          編集取消
        </button>
      )}

      <div style={{ overflowX: "auto", marginTop: 12 }}>
        <table
          border="1"
          cellPadding="6"
          style={{ borderCollapse: "collapse", width: "100%" }}
        >
          <thead>
            <tr>
              <th>日付</th>
              <th>内容</th>
              <th>入金</th>
              <th>出金</th>
              <th>残高</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {calculatedRows.length === 0 ? (
              <tr>
                <td colSpan="6">まだ明細がありません</td>
              </tr>
            ) : (
              calculatedRows.map((item, i) => (
                <tr key={i}>
                  <td>{item.date}</td>
                  <td>{item.text}</td>
                  <td>{item.inMoney}</td>
                  <td>{item.outMoney}</td>
                  <td>{item.balance}</td>
                  <td>
                    <button onClick={() => editRow(i)}>修正</button>
                    <button
                      onClick={() => deleteRow(i)}
                      style={{ marginLeft: 6 }}
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <hr />

      <h3>将来予定</h3>

      {negative && (
        <div style={{ color: "red", fontWeight: "bold", marginBottom: 10 }}>
          ⚠ {negative.date} に残高がマイナスになります
        </div>
      )}

      <input
        type="date"
        value={planDate}
        onChange={(e) => setPlanDate(e.target.value)}
      />
      <br />
      <input
        placeholder="内容"
        value={planText}
        onChange={(e) => setPlanText(e.target.value)}
      />
      <br />
      <input
        placeholder="入金予定"
        value={planInVal}
        onChange={(e) => setPlanInVal(e.target.value)}
      />
      <br />
      <input
        placeholder="出金予定"
        value={planOutVal}
        onChange={(e) => setPlanOutVal(e.target.value)}
      />
      <br />
      <button onClick={addPlan}>
        {editPlanIndex === -1 ? "予定追加" : "予定更新"}
      </button>
      {editPlanIndex !== -1 && (
        <button onClick={resetPlanForm} style={{ marginLeft: 8 }}>
          編集取消
        </button>
      )}

      <div style={{ overflowX: "auto", marginTop: 12 }}>
        <table
          border="1"
          cellPadding="6"
          style={{ borderCollapse: "collapse", width: "100%" }}
        >
          <thead>
            <tr>
              <th>日付</th>
              <th>内容</th>
              <th>入金</th>
              <th>出金</th>
              <th>試算残高</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {simulation.length === 0 ? (
              <tr>
                <td colSpan="6">まだ将来予定がありません</td>
              </tr>
            ) : (
              simulation.map((item, i) => (
                <tr key={i}>
                  <td>{item.date}</td>
                  <td>{item.text}</td>
                  <td>{item.inMoney}</td>
                  <td>{item.outMoney}</td>
                  <td>{item.balance}</td>
                  <td>
                    <button onClick={() => editPlan(i)}>修正</button>
                    <button
                      onClick={() => deletePlan(i)}
                      style={{ marginLeft: 6 }}
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
