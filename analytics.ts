import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { pb } from './pb';
import type { AnalyticsCollection } from './pb';

const app = new Hono();

function getSampleData(): AnalyticsCollection[] {
	return [
		{
			id: '1',
			created: new Date(
				Date.now() - 4 * 24 * 60 * 60 * 1000,
			).toISOString(),
			updated: new Date().toISOString(),
			member_count: 10,
			presence_count: 7,
		},
		{
			id: '2',
			created: new Date(
				Date.now() - 3 * 24 * 60 * 60 * 1000,
			).toISOString(),
			updated: new Date().toISOString(),
			member_count: 15,
			presence_count: 12,
		},
		{
			id: '3',
			created: new Date(
				Date.now() - 2 * 24 * 60 * 60 * 1000,
			).toISOString(),
			updated: new Date().toISOString(),
			member_count: 20,
			presence_count: 18,
		},
		{
			id: '4',
			created: new Date(
				Date.now() - 1 * 24 * 60 * 60 * 1000,
			).toISOString(),
			updated: new Date().toISOString(),
			member_count: 25,
			presence_count: 22,
		},
		{
			id: '5',
			created: new Date().toISOString(),
			updated: new Date().toISOString(),
			member_count: 30,
			presence_count: 27,
		},
	];
}

app.get('/', async (c) => {
	let records: AnalyticsCollection[];
	try {
		records = await pb.collection('analytics').getFullList();
		console.log('Fetched', records.length, 'records from PocketBase');
	} catch (e) {
		console.warn('Failed to fetch from PocketBase, using sample data:', e);
		records = getSampleData();
	}

	// Sort by creation date
	records.sort(
		(a, b) => new Date(a.created).getTime() - new Date(b.created).getTime(),
	);

	const dates = records.map(
		(r) => new Date(r.created).toISOString().split('T')[0],
	);
	const memberCounts = records.map((r) => r.member_count);
	const presenceCounts = records.map((r) => r.presence_count);

	const data = JSON.stringify({ dates, memberCounts, presenceCounts });

	const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Analytics Chart</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
<div style="margin-bottom:10px;">
  <label for="startDate">Start Date:</label>
  <input type="date" id="startDate" />
  <label for="endDate" style="margin-left:10px;">End Date:</label>
  <input type="date" id="endDate" />
  <button id="applyBtn" style="margin-left:10px;">Apply</button>
</div>
<div id="chartContainer" style="width:50vw; max-width:800px; height:50vh; margin:auto;"><canvas id="myChart" style="width:100%; height:100%;"></canvas></div>
<script>
const { dates, memberCounts, presenceCounts } = ${data};
let chartInstance = null;
function drawChart(filterDates, filterMembers, filterPresence) {
  const ctx = document.getElementById('myChart').getContext('2d');
  if (chartInstance) {
    chartInstance.destroy();
  }
  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: filterDates,
      datasets: [
        {
          label: 'Members',
          data: filterMembers,
          borderColor: 'steelblue',
          fill: false,
        },
        {
          label: 'Presence',
          data: filterPresence,
          borderColor: 'orange',
          fill: false,
        },
      ],
    },
    options: { responsive: true, maintainAspectRatio: false },
  });
}
function applyFilter() {
  const start = document.getElementById('startDate').value;
  const end = document.getElementById('endDate').value;
  const filtered = dates.map((d, i) => ({ d, m: memberCounts[i], p: presenceCounts[i] }))
    .filter(item => (!start || item.d >= start) && (!end || item.d <= end));
  const fDates = filtered.map(i => i.d);
  const fMembers = filtered.map(i => i.m);
  const fPresence = filtered.map(i => i.p);
  drawChart(fDates, fMembers, fPresence);
}
// Initial render with all data
drawChart(dates, memberCounts, presenceCounts);
// Attach event listener
document.getElementById('applyBtn').addEventListener('click', applyFilter);
</script>
</body>
</html>`;

	return c.html(html);
});

serve(app);
