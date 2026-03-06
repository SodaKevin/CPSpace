// src/pages/diaries/components/EmotionTrendChart.jsx

import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
);

export default function EmotionTrendChart({ trendData }) {
    const labels = trendData.map((d) =>
        new Date(d.date).toLocaleDateString("en-US", {
        weekday: "short",
        })
    );

    const rootStyles = getComputedStyle(document.documentElement);

    const accent = rootStyles.getPropertyValue("--accent").trim();
    const textMain = rootStyles.getPropertyValue("--text-main").trim();
    const borderColor = accent || "#5B8DEF";

    const data = {
    labels,
    datasets: [
        {
        label: "Emotional Balance",
        data: trendData.map((d) => d.score),
        borderColor: borderColor,
        backgroundColor: borderColor,
        borderWidth: 2,
        tension: 0.4,
        spanGaps: true,
        pointRadius: 4,
        pointHoverRadius: 6,
        },
    ],
    };

    const options = {
    responsive: true,
    maintainAspectRatio: false,

    layout: {
        padding: {
        left: 20,
        right: 20,
        top: 10,
        bottom: 0,
        },
    },

    plugins: {
        legend: { display: false },
        tooltip: {
        callbacks: {
            label: (context) => {
            if (context.raw === null) return "No data logged";
            return `Score: ${context.raw}`;
            },
        },
        },
    },

    scales: {
        y: {
        min: -1,
        max: 1,
        ticks: {
            stepSize: 0.5,
            // This function converts the numeric value to your custom label
            callback: function(value) {
            const labels = {
                1: 'Very Pleasant',
                0.5: 'Pleasant',
                0: 'Neutral',
                '-0.5': 'Unpleasant',
                '-1': 'Very Unpleasant'
            };
            return labels[value] || value;
            }
        },
        grid: {
            color: (ctx) =>
            ctx.tick.value === 0
                ? "rgba(150,150,150,0.5)"
                : "rgba(150,150,150,0.1)",
        },
        offset: true,
        },
        x: {
        grid: { display: false },
        offset: true,
        },
    },
    };

    return (
        <div
        style={{
            height: "260px",
            marginTop: "24px",
        }}
        >
        <Line data={data} options={options} />
        </div>
    );
}
