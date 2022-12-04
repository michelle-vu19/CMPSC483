import React from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import Box from "../components/box/Box";
import DashboardWrapper, {
  DashboardWrapperMain,
  DashboardWrapperRight,
} from "../components/dashboard-wrapper/DashboardWrapper";
import SummaryBox1, {
  SummaryBoxSpecial,
} from "../components/summary-box-1/SummaryBox1";
import { colors } from "../constants";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import OverallList from "../components/overall-list/OverallList";

const http = axios.create({
  baseURL: "http://localhost:8081",
  headers: {
    "Content-type": "application/json",
  },
});

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [data, setData] = React.useState({
    summary: [
      {
        title: "Completed Teams",
        subtitle: "Completion Progress",
        value: `Loading...`,
        percent: 0,
      },
      {
        title: "Assigned Students",
        subtitle: "Students Progess",
        value: "Loading...",
        percent: 0,
      },
    ],
    revenueByMonths: {
      labels: [
        "Major1",
        "Major2",
        "Major3",
        "Major4",
        "Major5",
        "Major6",
        "Major7",
        "Major8",
        "Major9",
        "Major10",
      ],
      data: [250, 200, 300, 280, 100, 220, 310, 190, 200, 120],
    },
  });

  React.useEffect(() => {
    const func = async () => {
      try {
        const dashboardMajor = await http.get("/api/dashboard-major");
        setData((old) => {
          return {
            ...old,
            revenueByMonths: {
              labels: dashboardMajor.data
                .map((info) => info.major ?? "(null)")
                .filter((major) => major !== "(null)"),
              data: dashboardMajor.data.map((info) => info.count),
            },
          };
        });

        const projectList = await http.get("/api/projects");

        const studentList = await http.get("/api/student-assignments");
        console.log(studentList.data);
        setData((old) => {
          return {
            ...old,
            summary: old.summary.map((info) => {
              if (info.title === "Assigned Students") {
                info.value = `${studentList.data.length} Students`;
                info.percent = `${Math.floor(
                  (studentList.data.filter(
                    (student) => student.project_id != null
                  ).length /
                    studentList.data.length) *
                    100
                )}`;
              }

              return info;
            }),
          };
        });
      } catch (error) {
        console.log(`Got error when retrieving dashboard data: ${error}`);
      }
    };

    func();
  }, []);

  return (
    <DashboardWrapper>
      <DashboardWrapperMain>
        <div className="row">
          <div className="col-12 col-md-12">
            <div className="row">
              {data.summary.map((item, index) => (
                <div
                  key={`summary-${index}`}
                  className="col-6 col-md-6 col-sm-12 mb"
                >
                  <SummaryBox1 item={item} />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <Box>
              <RevenueByMonthsChart data={data} />
            </Box>
          </div>
        </div>
      </DashboardWrapperMain>
    </DashboardWrapper>
  );
};

export default Dashboard;

const RevenueByMonthsChart = ({ data }) => {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      xAxes: {
        grid: {
          display: false,
          drawBorder: false,
        },
      },
      yAxes: {
        grid: {
          display: false,
          drawBorder: false,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    elements: {
      bar: {
        backgroundColor: colors.orange,
        borderRadius: 20,
        borderSkipped: "bottom",
      },
    },
  };

  const chartData = {
    labels: data.revenueByMonths.labels,
    datasets: [
      {
        label: "Students",
        data: data.revenueByMonths.data,
      },
    ],
  };
  return (
    <>
      <div className="title mb">Major Distribution</div>
      <div>
        <Bar options={chartOptions} data={chartData} height={`300px`} />
      </div>
    </>
  );
};
