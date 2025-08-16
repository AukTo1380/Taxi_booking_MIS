import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  FiDownload,
  FiFilter,
  FiPrinter,
  FiSearch,
  FiUsers,
  FiClipboard,
  FiHome,
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiBell,
  FiUserMinus,
  FiFileText,
} from "react-icons/fi";
const BASE_URL = import.meta.env.VITE_BASE_URL;
import { FaSpinner } from "react-icons/fa";
import DatePicker, { CalendarContainer } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import jalaali from "jalaali-js";

const API_BASE_URL = `${BASE_URL}`;
const ENDPOINTS = {
  EXPENDITURES: "/Expenditure/",
  EXPENDITURE_INCOME: "/Expenditure/income/",
  RENT: "/rent/",
  SERVICES: "/services/",
  SALARIES: "/staff/salaries/",
  CUSTOMERS: "/api/customers/",
  AGREEMENTS: "/agreements/",
  UNIT_BILLS: "/units/bills/",
  UNIT_FINANCES: "/units/finances/",
};

const ITEMS_PER_PAGE = 10;
const PIE_CHART_COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82ca9d",
  "#ffc658",
];

// --- Helper Functions ---
const formatCurrency = (value, currency = "AFN") => {
  const options =
    currency === "AFN"
      ? {
          style: "currency",
          currency: "AFN",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }
      : { style: "currency", currency: "USD" };
  try {
    const numericValue =
      typeof value === "string" ? parseFloat(value.replace(/,/g, "")) : value;
    if (isNaN(numericValue)) return String(value || 0);
    return new Intl.NumberFormat("en-US", options).format(numericValue || 0);
  } catch (error) {
    console.error("Currency format error:", error);
    return String(value || 0);
  }
};

const getPersianMonthNameJalaali = (monthNumber) => {
  const months = [
    "حمل",
    "ثور",
    "جوزا",
    "سرطان",
    "اسد",
    "سنبله",
    "میزان",
    "عقرب",
    "قوس",
    "جدی",
    "دلو",
    "حوت",
  ];
  return months[monthNumber - 1] || `Month ${monthNumber}`;
};

const getPersianDate = (dateString) => {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const { jy, jm, jd } = jalaali.toJalaali(
      date.getUTCFullYear(),
      date.getUTCMonth() + 1,
      date.getUTCDate()
    );
    return `${jy}/${String(jm).padStart(2, "0")}/${String(jd).padStart(
      2,
      "0"
    )}`;
  } catch (e) {
    console.error("Date format error:", dateString, e);
    return dateString;
  }
};

const shamsiToGregorianApprox = (jy, jm) => {
  if (
    !jy ||
    !jm ||
    isNaN(Number(jy)) ||
    isNaN(Number(jm)) ||
    Number(jm) < 1 ||
    Number(jm) > 12
  )
    return null;
  try {
    const { gy, gm, gd } = jalaali.toGregorian(Number(jy), Number(jm), 15);
    return new Date(Date.UTC(gy, gm - 1, gd));
  } catch (e) {
    console.error(`Error converting Shamsi ${jy}/${jm}:`, e);
    return null;
  }
};

// --- STABLE SHAMSI CALENDAR COMPONENTS ---
const ShamsiCustomInput = React.forwardRef(({ value, onClick }, ref) => {
  let displayValue = "تاریخ را انتخاب کنید";
  if (value) {
    try {
      const date = new Date(value);
      const { jy, jm, jd } = jalaali.toJalaali(date);
      displayValue = `${jy}/${String(jm).padStart(2, "0")}/${String(
        jd
      ).padStart(2, "0")}`;
    } catch (e) {
      displayValue = value;
    }
  }
  return (
    <button
      type="button"
      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm text-center"
      onClick={onClick}
      ref={ref}
    >
      {displayValue}
    </button>
  );
});
ShamsiCustomInput.displayName = "ShamsiCustomInput";

const MyShamsiCalendar = ({ className, children }) => {
  return (
    <div style={{ direction: "rtl", fontFamily: "sans-serif" }}>
      <CalendarContainer className={className}>
        <div style={{ position: "relative" }}>{children}</div>
      </CalendarContainer>
    </div>
  );
};

// --- Helper function to convert a Shamsi date to a Gregorian Date object ---
const getGregorianDateFromShamsi = (jy, jm, jd) => {
  try {
    const { gy, gm, gd } = jalaali.toGregorian(jy, jm, jd);
    return new Date(gy, gm - 1, gd);
  } catch (e) {
    console.error("Invalid Shamsi date for conversion:", jy, jm, jd);
    return new Date(); 
  }
};

const FinancialReports = () => {
  const [startDate, setStartDate] = useState(
    getGregorianDateFromShamsi(1404, 3, 1)
  );

  const [endDate, setEndDate] = useState(new Date()); 
  const [reportType, setReportType] = useState("all");
  const [summaryData, setSummaryData] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
  });
  const [extraSummary, setExtraSummary] = useState({
    totalCustomers: 0,
    activeAgreements: 0,
    activeShops: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [incomeSourceDistributionData, setIncomeSourceDistributionData] =
    useState([]);
  const [tableData, setTableData] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [customers, setCustomers] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [transactionTypeFilter, setTransactionTypeFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalReminder, setTotalReminder] = useState(0);
  const [totalSalaryReminder, setTotalSalaryReminder] = useState(0);
  const [totalUnitBillsReminder, setTotalUnitBillsReminder] = useState(0);

  const getTransactionDate = (item) => {
    const standardDateFields = [
      "issue_date",
      "payment_date",
      "transaction_date",
      "date",
      "created_at",
      "updated_at",
    ];
    for (const field of standardDateFields) {
      if (item?.[field] && typeof item[field] === "string") {
        try {
          let dateStr = item[field];
          if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            dateStr = `${dateStr}T00:00:00Z`;
          }
          const date = new Date(dateStr);
          if (!isNaN(date.getTime()) && date.getUTCFullYear() > 1970)
            return date;
        } catch (e) {
        }
      }
    }
    const year = item?.year ? Number(item.year) : NaN;
    const month = item?.month
      ? Number(item.month)
      : item?.time
      ? Number(item.time)
      : NaN;
    if (!isNaN(year) && !isNaN(month) && month >= 1 && month <= 12) {
      const gregorianDate = shamsiToGregorianApprox(year, month);
      if (gregorianDate) return gregorianDate;
    }
    return null;
  };

  const fetchReportData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setAllTransactions([]);
    setIncomeSourceDistributionData([]);
    setTotalReminder(0);
    setTotalSalaryReminder(0);
    setTotalUnitBillsReminder(0);
    let localCustomers = {};

    const validStartDate =
      startDate instanceof Date && !isNaN(startDate)
        ? new Date(
            Date.UTC(
              startDate.getFullYear(),
              startDate.getMonth(),
              startDate.getDate(),
              0,
              0,
              0,
              0
            )
          )
        : new Date(
            Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1)
          );
    const validEndDate =
      endDate instanceof Date && !isNaN(endDate)
        ? new Date(
            Date.UTC(
              endDate.getFullYear(),
              endDate.getMonth(),
              endDate.getDate(),
              23,
              59,
              59,
              999
            )
          )
        : new Date();

    const apiClient = axios.create({ baseURL: API_BASE_URL });

    const safeFetchData = async (url, params = {}) => {
      try {
        const response = await apiClient.get(url, {
          params: { ...params, page_size: 10000 },
        });
        const data = response.data?.results ?? response.data ?? [];
        return Array.isArray(data) ? data : [];
      } catch (error) {
        const status = error.response?.status;
        const errorData = error.response?.data;
        const detail =
          errorData?.detail ||
          errorData?.message ||
          (typeof errorData === "string" ? errorData : null);
        const message = error.message || "Unknown fetch error";
        const shortUrl = url.replace(API_BASE_URL, "").split("?")[0];
        let userMsg = `خطا در دریافت ${shortUrl}: `;
        if (status === 404) userMsg += "یافت نشد.";
        else if (message.includes("Network Error")) userMsg += "خطای شبکه.";
        else if (detail) userMsg += detail;
        else userMsg += message;
        console.error(
          `Error fetching ${url}:`,
          status,
          detail || message,
          error.response
        );
        setError((prev) => (prev ? `${prev}\n${userMsg}` : userMsg));
        return [];
      }
    };

    const filterItemByDate = (item) => {
      const transactionDate = getTransactionDate(item);
      return (
        transactionDate instanceof Date &&
        !isNaN(transactionDate.getTime()) &&
        transactionDate.getTime() >= validStartDate.getTime() &&
        transactionDate.getTime() <= validEndDate.getTime()
      );
    };

    try {
      const [
        expendituresData,
        expenditureIncomeData,
        rentData,
        serviceData,
        salaryData,
        customerData,
        agreementData,
        unitBillsData,
        unitFinancesData,
      ] = await Promise.all([
        safeFetchData(ENDPOINTS.EXPENDITURES),
        safeFetchData(ENDPOINTS.EXPENDITURE_INCOME),
        safeFetchData(ENDPOINTS.RENT),
        safeFetchData(ENDPOINTS.SERVICES),
        safeFetchData(ENDPOINTS.SALARIES),
        safeFetchData(ENDPOINTS.CUSTOMERS),
        safeFetchData(ENDPOINTS.AGREEMENTS),
        safeFetchData(ENDPOINTS.UNIT_BILLS),
        safeFetchData(ENDPOINTS.UNIT_FINANCES),
      ]);

      localCustomers = customerData.reduce((acc, customer) => {
        if (customer?.id)
          acc[customer.id] =
            customer.full_name || customer.name || `مشتری ${customer.id}`;
        return acc;
      }, {});
      setCustomers(localCustomers);

      const activeAgreementsList = Array.isArray(agreementData)
        ? agreementData.filter((a) => a?.status === "Active")
        : [];
      const uniqueActiveShops = new Set();
      activeAgreementsList.forEach((agreement) => {
        const shopRef = agreement?.shop;
        if (Array.isArray(shopRef))
          shopRef.forEach((id) => id && uniqueActiveShops.add(id));
        else if (shopRef) uniqueActiveShops.add(shopRef);
      });
      setExtraSummary({
        totalCustomers: customerData.length,
        activeAgreements: activeAgreementsList.length,
        activeShops: uniqueActiveShops.size,
      });

      const filteredExpenditures = expendituresData.filter(filterItemByDate);
      const filteredExpenditureIncome =
        expenditureIncomeData.filter(filterItemByDate);
      const filteredRent = rentData.filter(filterItemByDate);
      const filteredService = serviceData.filter(filterItemByDate);
      const filteredSalary = salaryData.filter(filterItemByDate);
      const filteredUnitBills = unitBillsData.filter(filterItemByDate);
      const filteredUnitFinances = unitFinancesData.filter(filterItemByDate);

      let combined = [];
      let monthlyTotals = {};

      const addTransaction = (
        item,
        type,
        amountInput,
        date,
        description,
        category,
        sourceApi,
        relatedId = null,
        relatedEntity = null
      ) => {
        if (
          !item ||
          !type ||
          !date ||
          !(date instanceof Date) ||
          isNaN(date.getTime()) ||
          !sourceApi
        )
          return;
        const amount = parseFloat(String(amountInput).replace(/,/g, "") || 0);
        if (isNaN(amount) || amount <= 0) return;

        let relatedName = "-";
        if (
          relatedEntity === "customer" &&
          relatedId &&
          localCustomers[relatedId]
        ) {
          relatedName = localCustomers[relatedId];
        } else if (relatedEntity === "staff" && relatedId) {
          if (typeof item?.staff === "object" && item.staff?.name)
            relatedName = item.staff.name;
          else if (typeof item?.staff === "string" && item.staff)
            relatedName = item.staff;
          else if (
            item.customers_list &&
            relatedId &&
            item.customers_list[relatedId]?.name
          )
            relatedName = item.customers_list[relatedId].name;
          else relatedName = `کارمند ${relatedId}`;
        } else if (item?.receiver && !relatedId && !relatedEntity) {
          relatedName =
            typeof item.receiver === "string"
              ? item.receiver
              : `گیرنده ${item.receiver}`;
        } else if (relatedId) {
          relatedName = `ID: ${relatedId}`;
        }

        combined.push({
          key: `${sourceApi}-${item.id}-${Math.random()}`,
          date: date.toISOString(),
          description: description || "-",
          category: category || "بدون کتگوری",
          amount,
          type,
          sourceApi,
          relatedName,
        });

        const monthKey = `${date.getUTCFullYear()}-${String(
          date.getUTCMonth() + 1
        ).padStart(2, "0")}`;
        if (!monthlyTotals[monthKey])
          monthlyTotals[monthKey] = { revenue: 0, expenses: 0, profit: 0 };
        if (type === "income") monthlyTotals[monthKey].revenue += amount;
        else monthlyTotals[monthKey].expenses += amount;
        monthlyTotals[monthKey].profit =
          monthlyTotals[monthKey].revenue - monthlyTotals[monthKey].expenses;
      };

      filteredExpenditures.forEach((item) =>
        addTransaction(
          item,
          "expense",
          item.amount,
          getTransactionDate(item),
          item.description || `مصارف: ${item.category || "عمومی"}`,
          item.category || "مصارف عمومی",
          ENDPOINTS.EXPENDITURES,
          item.receiver
        )
      );
      filteredExpenditureIncome.forEach((item) =>
        addTransaction(
          item,
          "income",
          item.amount,
          getTransactionDate(item),
          item.description || item.source || `درآمد متفرقه`,
          item.source || "درآمد متفرقه",
          ENDPOINTS.EXPENDITURE_INCOME,
          item.receiver
        )
      );
      filteredRent.forEach((r) => {
        const d = getTransactionDate(r);
        if (!d) return;
        if (r.customers_list)
          Object.entries(r.customers_list).forEach(([id, det]) => {
            if (det?.taken)
              addTransaction(
                r,
                "income",
                det.taken,
                d,
                `کرایه - منزل: ${r.floor ?? "N/A"} - ${
                  localCustomers[id] || `مشتری ${id}`
                }`,
                "کرایه",
                ENDPOINTS.RENT,
                id,
                "customer"
              );
          });
        else if (r.total_taken)
          addTransaction(
            r,
            "income",
            r.total_taken,
            d,
            `کرایه کلی - منزل: ${r.floor ?? "N/A"}`,
            "کرایه",
            ENDPOINTS.RENT,
            r.id
          );
      });
      filteredService.forEach((s) => {
        const d = getTransactionDate(s);
        if (!d) return;
        if (s.customers_list)
          Object.entries(s.customers_list).forEach(([id, det]) => {
            if (det?.taken)
              addTransaction(
                s,
                "income",
                det.taken,
                d,
                `فیس خدمات - منزل: ${s.floor ?? "N/A"} - ${
                  localCustomers[id] || `مشتری ${id}`
                }`,
                "فیس خدمات",
                ENDPOINTS.SERVICES,
                id,
                "customer"
              );
          });
        else if (s.total_taken)
          addTransaction(
            s,
            "income",
            s.total_taken,
            d,
            `فیس خدمات کلی - منزل: ${s.floor ?? "N/A"}`,
            "فیس خدمات",
            ENDPOINTS.SERVICES,
            s.id
          );
      });
      filteredUnitBills.forEach((b) => {
        const d = getTransactionDate(b);
        if (!d) return;
        if (b.unit_details_list)
          Object.values(b.unit_details_list).forEach((u) => {
            if (u?.taken > 0)
              addTransaction(
                b,
                "income",
                u.taken,
                d,
                `بیل واحد: ${u.customer_name || "نامعلوم"} (واحد ${
                  u.unit_number || "نامعلوم"
                })`,
                "بیل واحدها",
                ENDPOINTS.UNIT_BILLS,
                u.unit_id
              );
          });
      });
      filteredUnitFinances.forEach((f) =>
        addTransaction(
          f,
          "expense",
          f.amount,
          getTransactionDate(f),
          `تخفیف واحد: ${f.description || "بدون شرح"}`,
          "تخفیف واحدها",
          ENDPOINTS.UNIT_FINANCES,
          f.id
        )
      );
      filteredSalary.forEach((s) => {
        const d = getTransactionDate(s);
        if (!d) return;
        if (s.total_taken > 0) {
          const staffId = s.staff?.id || s.staff;
          addTransaction(
            s,
            "expense",
            s.total_taken,
            d,
            `پرداخت معاش - ${s.staff?.name || "کارمندان"}`,
            "معاش",
            ENDPOINTS.SALARIES,
            staffId,
            "staff"
          );
        }
      });

      const calculateReminder = (dataList) =>
        dataList.reduce((sum, item) => {
          let remainder = parseFloat(
            String(item.total_remainder).replace(/,/g, "") || 0
          );
          if (item.customers_list && (isNaN(remainder) || remainder <= 0)) {
            remainder = Object.values(item.customers_list).reduce(
              (custSum, det) =>
                custSum +
                parseFloat(String(det?.remainder).replace(/,/g, "") || 0),
              0
            );
          }
          return sum + (remainder > 0 ? remainder : 0);
        }, 0);
      setTotalReminder(
        calculateReminder(filteredRent) + calculateReminder(filteredService)
      );
      setTotalSalaryReminder(calculateReminder(filteredSalary));
      setTotalUnitBillsReminder(calculateReminder(filteredUnitBills));

      const totalRevenue = combined
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);
      const totalExpenses = combined
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);
      setSummaryData({
        totalRevenue,
        totalExpenses,
        netProfit: totalRevenue - totalExpenses,
      });

      const chartDataFormatted = Object.entries(monthlyTotals)
        .map(([period, data]) => {
          const [year, month] = period.split("-");
          const { jy, jm } = jalaali.toJalaali(
            parseInt(year),
            parseInt(month),
            15
          );
          const label = `${getPersianMonthNameJalaali(jm)} ${jy}`;
          return { monthLabel: label, period, ...data };
        })
        .sort((a, b) => a.period.localeCompare(b.period));
      setChartData(chartDataFormatted);

      combined.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setAllTransactions(combined);

      const incomeSources = combined
        .filter((t) => t.type === "income")
        .reduce((acc, t) => {
          const sourceName = t.category || "سایر درآمدها";
          acc[sourceName] = (acc[sourceName] || 0) + t.amount;
          return acc;
        }, {});
      setIncomeSourceDistributionData(
        Object.entries(incomeSources)
          .map(([name, value]) => ({ name, value }))
          .filter((item) => item.value > 0)
          .sort((a, b) => b.value - a.value)
      );
    } catch (err) {
      console.error("!!! Error during MAIN data processing steps:", err);
      const displayError = err.message?.includes("Network Error")
        ? "خطای شبکه: اتصال به سرور برقرار نشد."
        : `خطا در پردازش اطلاعات: ${err.message || "یک خطای ناشناخته رخ داد."}`;
      setError((prev) => (prev ? `${prev}\n${displayError}` : displayError));
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  useEffect(() => {
    if (!allTransactions || allTransactions.length === 0) {
      setTableData([]);
      setTotalItems(0);
      setTotalPages(1);
      setCurrentPage(1);
      return;
    }
    const filtered = allTransactions.filter((item) => {
      if (!item) return false;
      const searchTermLower = searchTerm.toLowerCase();
      const typeMatch =
        !transactionTypeFilter || item.type === transactionTypeFilter;
      const searchMatch =
        !searchTerm ||
        item.description?.toLowerCase().includes(searchTermLower) ||
        item.relatedName?.toLowerCase().includes(searchTermLower) ||
        item.category?.toLowerCase().includes(searchTermLower);
      const categoryMatch = !categoryFilter || item.category === categoryFilter;
      return typeMatch && searchMatch && categoryMatch;
    });
    setTotalItems(filtered.length);
    const newTotalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
    setTotalPages(newTotalPages);
    const newCurrentPage = Math.max(1, Math.min(currentPage, newTotalPages));
    setCurrentPage(newCurrentPage);
    setTableData(
      filtered.slice(
        (newCurrentPage - 1) * ITEMS_PER_PAGE,
        newCurrentPage * ITEMS_PER_PAGE
      )
    );
  }, [
    allTransactions,
    currentPage,
    searchTerm,
    categoryFilter,
    transactionTypeFilter,
  ]);

  const handleApplyFilters = () => {
    setCurrentPage(1);
    fetchReportData();
  };
  const handlePrint = () => window.print();
  const handleDownload = () => alert("عملکرد دانلود نیاز به پیاده‌سازی دارد.");
  const handleLocalFilterChange = (setter, value) => {
    setter(value);
    setCurrentPage(1);
  };
  const handleSearchChange = (e) =>
    handleLocalFilterChange(setSearchTerm, e.target.value);
  const handleCategoryChange = (e) =>
    handleLocalFilterChange(setCategoryFilter, e.target.value);
  const handleTransactionTypeChange = (e) =>
    handleLocalFilterChange(setTransactionTypeFilter, e.target.value);
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };

  const uniqueCategories = useMemo(
    () =>
      Array.from(
        new Set(allTransactions.map((t) => t.category).filter(Boolean))
      ).sort((a, b) => a.localeCompare(b, "fa")),
    [allTransactions]
  );

  return (
    <div className="space-y-6 p-4 md:p-6 bg-gray-50 min-h-screen font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <h2 className="text-xl lg:text-2xl font-semibold text-gray-800 self-start sm:self-center">
          گزارشات مالی
        </h2>
        <div className="flex space-x-2 sm:space-x-3 space-x-reverse self-end sm:self-center">
          <button
            onClick={handleDownload}
            disabled={isLoading || tableData.length === 0}
            className="flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiDownload className="ml-1 sm:ml-2" /> خروجی
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FiPrinter className="ml-1 sm:ml-2" /> چاپ
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              از تاریخ
            </label>
            <DatePicker
              selected={startDate}
              onChange={(date) => date && setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              maxDate={endDate}
              customInput={<ShamsiCustomInput />}
              popperPlacement="bottom-start"
              renderCustomHeader={({
                date,
                decreaseMonth,
                increaseMonth,
                prevMonthButtonDisabled,
                nextMonthButtonDisabled,
              }) => {
                const jalaaliDate = jalaali.toJalaali(date);
                return (
                  <div
                    style={{
                      margin: 10,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <button
                      onClick={increaseMonth}
                      disabled={nextMonthButtonDisabled}
                      className="react-datepicker__navigation react-datepicker__navigation--next"
                    >
                      {"<"}
                    </button>
                    <span className="react-datepicker__current-month">
                      {getPersianMonthNameJalaali(jalaaliDate.jm)}{" "}
                      {jalaaliDate.jy}
                    </span>
                    <button
                      onClick={decreaseMonth}
                      disabled={prevMonthButtonDisabled}
                      className="react-datepicker__navigation react-datepicker__navigation--previous"
                    >
                      {">"}
                    </button>
                  </div>
                );
              }}
              formatWeekDay={(nameOfDay) => nameOfDay.substring(0, 1)}
              calendarContainer={MyShamsiCalendar}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              تا تاریخ
            </label>
            <DatePicker
              selected={endDate}
              onChange={(date) => date && setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              customInput={<ShamsiCustomInput />}
              popperPlacement="bottom-start"
              renderCustomHeader={({
                date,
                decreaseMonth,
                increaseMonth,
                prevMonthButtonDisabled,
                nextMonthButtonDisabled,
              }) => {
                const jalaaliDate = jalaali.toJalaali(date);
                return (
                  <div
                    style={{
                      margin: 10,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <button
                      onClick={increaseMonth}
                      disabled={nextMonthButtonDisabled}
                      className="react-datepicker__navigation react-datepicker__navigation--next"
                    >
                      {"<"}
                    </button>
                    <span className="react-datepicker__current-month">
                      {getPersianMonthNameJalaali(jalaaliDate.jm)}{" "}
                      {jalaaliDate.jy}
                    </span>
                    <button
                      onClick={decreaseMonth}
                      disabled={prevMonthButtonDisabled}
                      className="react-datepicker__navigation react-datepicker__navigation--previous"
                    >
                      {">"}
                    </button>
                  </div>
                );
              }}
              formatWeekDay={(nameOfDay) => nameOfDay.substring(0, 1)}
              calendarContainer={MyShamsiCalendar}
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleApplyFilters}
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-sm font-medium"
            >
              {isLoading ? (
                <FaSpinner className="animate-spin ml-2" />
              ) : (
                <FiFilter className="ml-2" />
              )}
              اعمال محدوده تاریخ
            </button>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-blue-500 transition-shadow hover:shadow-md">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xl text-gray-500 mb-1 uppercase font-medium">
                مجموع عواید
              </p>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-800">
                {isLoading && !summaryData.totalRevenue ? (
                  <FaSpinner className="animate-spin text-blue-500" />
                ) : (
                  formatCurrency(summaryData.totalRevenue)
                )}
              </h3>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FiTrendingUp className="text-blue-500 text-lg" />
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-red-500 transition-shadow hover:shadow-md">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xl text-gray-500 mb-1 uppercase font-medium">
                مجموع مصارف
              </p>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-800">
                {isLoading && !summaryData.totalExpenses && !error ? (
                  <FaSpinner className="animate-spin text-red-500" />
                ) : (
                  formatCurrency(summaryData.totalExpenses)
                )}
              </h3>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <FiTrendingDown className="text-red-500 text-lg" />
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-green-500 transition-shadow hover:shadow-md">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xl text-gray-500 mb-1 uppercase font-medium">
                سود / زیان خالص
              </p>
              <h3
                className={`text-xl lg:text-2xl font-bold ${
                  summaryData.netProfit >= 0
                    ? "text-green-700"
                    : "text-yellow-600"
                }`}
              >
                {isLoading &&
                !(summaryData.totalRevenue || summaryData.totalExpenses) &&
                !error ? (
                  <FaSpinner className="animate-spin text-green-500" />
                ) : (
                  formatCurrency(summaryData.netProfit)
                )}
              </h3>
            </div>
            <div
              className={`${
                summaryData.netProfit >= 0 ? "bg-green-100" : "bg-yellow-100"
              } p-3 rounded-full`}
            >
              <FiDollarSign
                className={`${
                  summaryData.netProfit >= 0
                    ? "text-green-500"
                    : "text-yellow-500"
                } text-lg`}
              />
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-yellow-500 transition-shadow hover:shadow-md">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xl text-gray-500 mb-1 uppercase font-medium">
                باقیات (کرایه/خدمات)
              </p>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-800">
                {isLoading && totalReminder === 0 && !error ? (
                  <FaSpinner className="animate-spin text-yellow-500" />
                ) : (
                  formatCurrency(totalReminder)
                )}
              </h3>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <FiBell className="text-yellow-500 text-lg" />
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-cyan-500 transition-shadow hover:shadow-md">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xl text-gray-500 mb-1 uppercase font-medium">
                باقیات احدها
              </p>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-800">
                {isLoading && totalUnitBillsReminder === 0 && !error ? (
                  <FaSpinner className="animate-spin text-cyan-500" />
                ) : (
                  formatCurrency(totalUnitBillsReminder)
                )}
              </h3>
            </div>
            <div className="bg-cyan-100 p-3 rounded-full">
              <FiFileText className="text-cyan-500 text-lg" />
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-rose-500 transition-shadow hover:shadow-md">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xl text-gray-500 mb-1 uppercase font-medium">
                مجموع معاشات باقی مانده
              </p>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-800">
                {isLoading && totalSalaryReminder === 0 && !error ? (
                  <FaSpinner className="animate-spin text-rose-500" />
                ) : (
                  formatCurrency(totalSalaryReminder)
                )}
              </h3>
            </div>
            <div className="bg-rose-100 p-3 rounded-full">
              <FiUserMinus className="text-rose-500 text-lg" />
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-orange-500 transition-shadow hover:shadow-md">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xl text-gray-500 mb-1 uppercase font-medium">
                دکان های فعال
              </p>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-800">
                {isLoading && !extraSummary.activeShops ? (
                  <FaSpinner className="animate-spin text-orange-500" />
                ) : (
                  extraSummary.activeShops
                )}
              </h3>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <FiHome className="text-orange-500 text-lg" />
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-purple-500 transition-shadow hover:shadow-md">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xl text-gray-500 mb-1 uppercase font-medium">
                مجموع مشتریان
              </p>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-800">
                {isLoading && !extraSummary.totalCustomers ? (
                  <FaSpinner className="animate-spin text-purple-500" />
                ) : (
                  extraSummary.totalCustomers
                )}
              </h3>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <FiUsers className="text-purple-500 text-lg" />
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-teal-500 transition-shadow hover:shadow-md">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xl text-gray-500 mb-1 uppercase font-medium">
                قراردادهای فعال
              </p>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-800">
                {isLoading && !extraSummary.activeAgreements ? (
                  <FaSpinner className="animate-spin text-teal-500" />
                ) : (
                  extraSummary.activeAgreements
                )}
              </h3>
            </div>
            <div className="bg-teal-100 p-3 rounded-full">
              <FiClipboard className="text-teal-500 text-lg" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            عواید ماهانه در مقابل مصارف
          </h3>
          <div className="h-80 relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-20">
                <FaSpinner className="animate-spin text-blue-600 text-3xl" />
              </div>
            )}
            {!isLoading && chartData.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500 p-4 text-center text-sm">
                {error ? "خطا در بارگذاری گراف." : "داده ای یافت نشد."}
              </div>
            )}
            {chartData.length > 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 5, right: 5, left: -15, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="monthLabel"
                    tick={{ fontSize: 10, fill: "#6b7280" }}
                    angle={-30}
                    textAnchor="end"
                    height={40}
                    interval={0}
                  />
                  <YAxis
                    tickFormatter={(v) =>
                      formatCurrency(v, "AFN").replace(/AFN|\s/g, "")
                    }
                    tick={{ fontSize: 10, fill: "#6b7280" }}
                    width={45}
                  />
                  <Tooltip
                    contentStyle={{
                      fontSize: "12px",
                      direction: "rtl",
                      borderRadius: "8px",
                      padding: "8px",
                    }}
                    formatter={(v, n) => [
                      formatCurrency(v),
                      n === "revenue" ? "عواید" : "مصارف",
                    ]}
                    labelFormatter={(l) => `ماه: ${l}`}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "11px", paddingTop: "15px" }}
                    verticalAlign="top"
                    align="center"
                  />
                  <Bar
                    dataKey="revenue"
                    name="عواید"
                    fill="#4f46e5"
                    radius={[4, 4, 0, 0]}
                    barSize={15}
                  />
                  <Bar
                    dataKey="expenses"
                    name="مصارف"
                    fill="#f43f5e"
                    radius={[4, 4, 0, 0]}
                    barSize={15}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            توزیع منابع درآمد
          </h3>
          <div className="h-80 relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-20">
                <FaSpinner className="animate-spin text-purple-600 text-3xl" />
              </div>
            )}
            {!isLoading && incomeSourceDistributionData.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500 p-4 text-center text-sm">
                {error ? "خطا در بارگذاری." : "درآمدی یافت نشد."}
              </div>
            )}
            {incomeSourceDistributionData.length > 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incomeSourceDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius="80%"
                    innerRadius="40%"
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    paddingAngle={2}
                    label={({
                      cx,
                      cy,
                      midAngle,
                      innerRadius,
                      outerRadius,
                      percent,
                    }) => {
                      if (percent * 100 < 3) return null;
                      const r = innerRadius + (outerRadius - innerRadius) * 0.5;
                      const x = cx + r * Math.cos((-midAngle * Math.PI) / 180);
                      const y = cy + r * Math.sin((-midAngle * Math.PI) / 180);
                      return (
                        <text
                          x={x}
                          y={y}
                          fill="#fff"
                          textAnchor={x > cx ? "start" : "end"}
                          dominantBaseline="central"
                          fontSize={9}
                          fontWeight="bold"
                        >{`${(percent * 100).toFixed(0)}%`}</text>
                      );
                    }}
                  >
                    {incomeSourceDistributionData.map((e, i) => (
                      <Cell
                        key={`cell-${i}`}
                        fill={PIE_CHART_COLORS[i % PIE_CHART_COLORS.length]}
                        stroke="#fff"
                        strokeWidth={1}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [formatCurrency(v), n]} />
                  <Legend
                    wrapperStyle={{
                      fontSize: "11px",
                      lineHeight: "1.5",
                      maxHeight: "100px",
                      overflowY: "auto",
                    }}
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    iconType="circle"
                    iconSize={8}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
          <h3 className="text-xl sm:text-xl font-semibold text-gray-800">
            نمای کلی مالی ماهانه (گراف)
          </h3>
          <select
            id="fr_chartReportType"
            className="p-1.5 border border-gray-300 rounded-lg bg-white text-xs"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="all">همه موارد</option>
            <option value="revenue">عواید</option>
            <option value="expenses">مصارف</option>
            <option value="profit">سود</option>
          </select>
        </div>
        <div className="h-80 sm:h-96 relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-20">
              <FaSpinner className="animate-spin text-blue-600 text-4xl" />
            </div>
          )}
          {!isLoading && chartData.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500 p-4 text-center text-sm">
              {error ? "خطا در بارگذاری گراف." : "داده ای یافت نشد."}
            </div>
          )}
          {chartData.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 5, left: 15, bottom: 45 }}
              >
                <defs>
                  <linearGradient id="cR" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="cE" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="cP" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  vertical={false}
                />
                <XAxis
                  dataKey="monthLabel"
                  tick={{ fontSize: 10, fill: "#6b7280" }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tickFormatter={(v) =>
                    formatCurrency(v, "AFN").replace(/AFN|\s/g, "")
                  }
                  tick={{ fontSize: 10, fill: "#6b7280" }}
                  width={55}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: "12px",
                    direction: "rtl",
                    borderRadius: "8px",
                    padding: "8px",
                  }}
                  formatter={(v, n) => [formatCurrency(v), n]}
                  labelFormatter={(l) => `ماه: ${l}`}
                />
                <Legend
                  wrapperStyle={{ fontSize: "11px", paddingTop: "15px" }}
                  verticalAlign="top"
                  align="center"
                />
                {(reportType === "revenue" || reportType === "all") && (
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="عواید"
                    stroke="#4f46e5"
                    fillOpacity={1}
                    fill="url(#cR)"
                    strokeWidth={2}
                  />
                )}
                {(reportType === "expenses" || reportType === "all") && (
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    name="مصارف"
                    stroke="#ec4899"
                    fillOpacity={1}
                    fill="url(#cE)"
                    strokeWidth={2}
                  />
                )}
                {(reportType === "profit" || reportType === "all") && (
                  <Area
                    type="monotone"
                    dataKey="profit"
                    name="سود"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#cP)"
                    strokeWidth={2}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div
        id="fr_transaction-table"
        className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200"
      >
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-3 md:gap-4 flex-wrap">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 whitespace-nowrap mr-4 order-1 md:order-1">
            جزئیات تراکنش ها ({totalItems})
          </h3>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 sm:space-x-reverse w-full md:w-auto items-stretch sm:items-center order-3 md:order-2">
            <select
              className="p-2 border border-gray-300 rounded-lg text-xs sm:text-sm bg-white"
              value={transactionTypeFilter}
              onChange={handleTransactionTypeChange}
            >
              <option value="">همه انواع</option>
              <option value="income">درآمد</option>
              <option value="expense">هزینه</option>
            </select>
            <select
              className="p-2 border border-gray-300 rounded-lg text-xs sm:text-sm bg-white"
              value={categoryFilter}
              onChange={handleCategoryChange}
              disabled={uniqueCategories.length === 0}
            >
              <option value="">همه دسته بندی ها</option>
              {uniqueCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <div className="relative w-full sm:w-auto">
              <input
                type="text"
                placeholder="جستجو..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="p-2 border border-gray-300 rounded-lg text-xs sm:text-sm w-full pr-8"
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto relative min-h-[250px]">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-60 z-10">
              <FaSpinner className="animate-spin text-blue-600 text-3xl" />
            </div>
          )}
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="sticky top-0 px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase"
                >
                  تاریخ
                </th>
                <th
                  scope="col"
                  className="sticky top-0 px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase min-w-[150px]"
                >
                  شرح
                </th>
                <th
                  scope="col"
                  className="sticky top-0 px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase"
                >
                  دسته بندی
                </th>
                <th
                  scope="col"
                  className="sticky top-0 px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase"
                >
                  مقدار
                </th>
                <th
                  scope="col"
                  className="sticky top-0 px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase"
                >
                  نوع
                </th>
                <th
                  scope="col"
                  className="sticky top-0 px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase"
                >
                  مربوط به
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {!isLoading && tableData.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-10 text-center text-sm text-gray-500"
                  >
                    {allTransactions.length > 0
                      ? "تراکنشی مطابق با فیلترها یافت نشد."
                      : error
                      ? "خطا در بارگذاری جدول."
                      : "تراکنشی یافت نشد."}
                  </td>
                </tr>
              )}
              {tableData.map((item) => (
                <tr key={item.key} className="hover:bg-gray-50 align-top">
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-700">
                    {getPersianDate(item.date)}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-800 max-w-xs break-words">
                    {item.description}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600">
                    {item.category}
                  </td>
                  <td
                    className={`px-4 py-3 whitespace-nowrap text-xs font-medium ${
                      item.type === "income" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {item.type === "income" ? "+" : "-"}{" "}
                    {formatCurrency(item.amount)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-0.5 inline-flex text-[11px] leading-4 font-semibold rounded-full ${
                        item.type === "income"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {item.type === "income" ? "درآمد" : "هزینه"}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600">
                    {item.relatedName || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!isLoading && totalItems > ITEMS_PER_PAGE && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center mt-4 px-2 gap-3 border-t border-gray-200 pt-4">
            <div className="text-xs sm:text-sm text-gray-600">
              نمایش {(currentPage - 1) * ITEMS_PER_PAGE + 1} تا{" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} از{" "}
              {totalItems} مورد
            </div>
            <div className="flex items-center space-x-1 space-x-reverse">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-xs sm:text-sm disabled:opacity-50"
              >
                قبلی
              </button>
              <span className="px-3 py-1 border border-gray-300 rounded-md text-xs sm:text-sm bg-gray-100 font-medium">
                صفحه {currentPage} از {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md text-xs sm:text-sm disabled:opacity-50"
              >
                بعدی
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialReports;
