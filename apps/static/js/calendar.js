document.addEventListener('DOMContentLoaded', function() {
    const calendar = document.getElementById('calendar');
    const daysInMonth = 30; // Assuming April has 30 days
    const firstDay = 5; // Assuming April 1st is on a Friday (0-indexed, so 5 represents Friday)

    // Add day labels
    const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    dayLabels.forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.textContent = day;
        dayElement.classList.add('text-center', 'font-medium');
        calendar.appendChild(dayElement);
    });

    // Add empty cells for days before the 1st
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        calendar.appendChild(emptyDay);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
        const dayElement = document.createElement('div');
        dayElement.textContent = i;
        dayElement.classList.add('calendar-day');
        if (i === 8) {
            dayElement.classList.add('active');
        }
        calendar.appendChild(dayElement);
    }

    // Add click event to calendar days
    calendar.addEventListener('click', function(e) {
        if (e.target.classList.contains('calendar-day')) {
            document.querySelectorAll('.calendar-day').forEach(day => day.classList.remove('active'));
            e.target.classList.add('active');
        }
    });
});