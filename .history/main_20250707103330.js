class Calendar {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.currentMonth = new Date();
        this.viewMode = 'month';
        this.timeMinutes = 30;
        this.focusInterval = null;
        this.remainingSeconds = 0;

        this.months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        this.monthsShort = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];

        this.init();
    }

    init() {
        this.bindEvents();
        this.updateDisplay();
        this.startRealTimeUpdate();
    }

    bindEvents() {
        document.getElementById('dateToggle').addEventListener('click', () => this.handleHeaderClick());
        document.getElementById('calendarTitle').addEventListener('click', () => this.handleNavTitleClick());
        const arrows = document.querySelectorAll('.arrow-controls span');
        if (arrows.length >= 2) {
            arrows[0].addEventListener('click', () => this.navigate(-1)); 
            arrows[1].addEventListener('click', () => this.navigate(1));
        }

        document.getElementById('minusTime').addEventListener('click', () => this.adjustTime(-5));
        document.getElementById('plusTime').addEventListener('click', () => this.adjustTime(15));
        document.getElementById('startBtn').addEventListener('click', () => this.toggleFocus());
    }

    adjustTime(minutes) {
        this.timeMinutes += minutes;
        if (this.timeMinutes < 5) this.timeMinutes = 5;
        if (this.timeMinutes > 480) this.timeMinutes = 480;
        this.updateTimeDisplay();
    }

    updateTimeDisplay() {
        const timeLabel = document.getElementById('durationLabel');
        if (this.timeMinutes >= 60) {
            const hours = Math.floor(this.timeMinutes / 60);
            const mins = this.timeMinutes % 60;
            if (mins === 0) {
                timeLabel.textContent = `${hours} hr${hours > 1 ? 's' : ''}`;
            } else {
                timeLabel.textContent = `${hours}h ${mins}m`;
            }
        } else {
            timeLabel.textContent = `${this.timeMinutes} mins`;
        }
    }

    toggleFocus() {
        const focusBtn = document.getElementById('startBtn');
        const icon = focusBtn.querySelector('.session-icon');
        const text = focusBtn.querySelector('span:last-child');

        if (text.textContent === 'Focus') {
            text.textContent = 'Stop';
            icon.textContent = '⏸';
            focusBtn.style.color = '#60a5fa';
            this.remainingSeconds = this.timeMinutes * 60;

            this.focusInterval = setInterval(() => {
                this.remainingSeconds--;
                this.updateCountdownDisplay();

                if (this.remainingSeconds <= 0) {
                    clearInterval(this.focusInterval);
                    this.focusInterval = null;
                    alert("Time's up!");
                    this.resetFocusButton();
                }
            }, 1000);

        } else {
            clearInterval(this.focusInterval);
            this.focusInterval = null;
            this.resetFocusButton();
            this.updateTimeDisplay(); 
        }
    }

    updateCountdownDisplay() {
        const timeLabel = document.getElementById('durationLabel');
        const minutes = Math.floor(this.remainingSeconds / 60);
        const seconds = this.remainingSeconds % 60;
        timeLabel.textContent = `${minutes}m ${seconds}s`;
    }

    resetFocusButton() {
        const focusBtn = document.getElementById('startBtn');
        const icon = focusBtn.querySelector('.session-icon');
        const text = focusBtn.querySelector('span:last-child');

        text.textContent = 'Focus';
        icon.textContent = '\u25B6';
        focusBtn.style.color = '#888888';
    }

    startRealTimeUpdate() {
        setInterval(() => {
            this.currentDate = new Date();
            this.updateHeaderDate();
        }, 1000);
    }

    handleHeaderClick() {
        if (this.viewMode !== 'month') {
            this.viewMode = 'month';
            this.updateDisplay();
        }
    }

    handleNavTitleClick() {
        switch (this.viewMode) {
            case 'month':
                this.viewMode = 'year';
                break;
            case 'year':
                this.viewMode = 'decade';
                break;
        }
        this.updateDisplay();
    }

    navigate(direction) {
        switch (this.viewMode) {
            case 'month':
                this.currentMonth.setMonth(this.currentMonth.getMonth() + direction);
                break;
            case 'year':
                this.currentMonth.setFullYear(this.currentMonth.getFullYear() + direction);
                break;
            case 'decade':
                this.currentMonth.setFullYear(this.currentMonth.getFullYear() + direction * 10);
                break;
        }
        this.updateDisplay();
    }

    updateDisplay() {
        this.updateHeaderDate();
        this.updateNavTitle();
        this.updateCalendarGrid();
        this.updateWeekdayHeader();
        this.updateTimeDisplay();
    }

    updateHeaderDate() {
        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        const dateText = this.currentDate.toLocaleDateString('en-US', options);
        document.getElementById('dateText').textContent = dateText;
    }

    updateNavTitle() {
        let titleText = '';
        switch (this.viewMode) {
            case 'month':
                titleText = `${this.months[this.currentMonth.getMonth()]} ${this.currentMonth.getFullYear()}`;
                break;
            case 'year':
                titleText = this.currentMonth.getFullYear().toString();
                break;
            case 'decade':
                const startYear = Math.floor(this.currentMonth.getFullYear() / 10) * 10;
                titleText = `${startYear} - ${startYear + 9}`;
                break;
        }
        document.getElementById('calendarTitleText').textContent = titleText;
    }

    updateWeekdayHeader() {
        const header = document.getElementById('weekdayHeader');
        const grid = document.getElementById('gridContainer');

        if (this.viewMode === 'month') {
            header.classList.remove('hidden');
            grid.className = 'grid-display month-view';
        } else {
            header.classList.add('hidden');
            grid.className = `grid-display ${this.viewMode}-view`;
        }
    }

    updateCalendarGrid() {
        const grid = document.getElementById('gridContainer');
        grid.innerHTML = '';

        switch (this.viewMode) {
            case 'month':
                this.renderMonthView(grid);
                break;
            case 'year':
                this.renderYearView(grid);
                break;
            case 'decade':
                this.renderDecadeView(grid);
                break;
        }
    }

    renderMonthView(grid) {
        const daysInMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 0).getDate();
        const firstDay = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), 1).getDay();
        const prevMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), 0);
        const prevMonthDays = prevMonth.getDate();

        for (let i = firstDay - 1; i >= 0; i--) {
            const day = document.createElement('div');
            day.className = 'grid-cell dimmed';
            day.textContent = prevMonthDays - i;
            grid.appendChild(day);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), day);
            const dayElement = document.createElement('div');
            dayElement.className = 'grid-cell';
            dayElement.textContent = day;

            if (this.isSameDay(date, this.currentDate)) dayElement.classList.add('today');
            if (this.isSameDay(date, this.selectedDate)) dayElement.classList.add('selected');

            dayElement.addEventListener('click', () => {
                this.selectedDate = new Date(date);
                this.updateDisplay();
            });

            grid.appendChild(dayElement);
        }

        const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
        const remainingCells = totalCells - (firstDay + daysInMonth);

        for (let day = 1; day <= remainingCells; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'grid-cell dimmed';
            dayElement.textContent = day;
            grid.appendChild(dayElement);
        }
    }

    renderYearView(grid) {
        for (let month = 0; month < 12; month++) {
            const monthElement = document.createElement('div');
            monthElement.className = 'year-cell';
            monthElement.textContent = this.monthsShort[month];

            const date = new Date(this.currentMonth.getFullYear(), month, 1);

            if (month === this.currentDate.getMonth() && this.currentMonth.getFullYear() === this.currentDate.getFullYear()) {
                monthElement.classList.add('current');
            }
            if (month === this.currentMonth.getMonth()) {
                monthElement.classList.add('selected');
            }

            monthElement.addEventListener('click', () => {
                this.currentMonth.setMonth(month);
                this.viewMode = 'month';
                this.updateDisplay();
            });

            grid.appendChild(monthElement);
        }
    }

    renderDecadeView(grid) {
        const currentYear = this.currentMonth.getFullYear();
        const startYear = Math.floor(currentYear / 10) * 10 - 2;

        for (let i = 0; i < 16; i++) {
            const year = startYear + i;
            const yearElement = document.createElement('div');
            yearElement.className = 'decade-cell';
            yearElement.textContent = year;

            if (year === this.currentDate.getFullYear()) yearElement.classList.add('current');
            if (year === this.currentMonth.getFullYear()) yearElement.classList.add('selected');
            if (i < 2 || i > 13) yearElement.classList.add('dimmed');

            yearElement.addEventListener('click', () => {
                this.currentMonth.setFullYear(year);
                this.viewMode = 'year';
                this.updateDisplay();
            });

            grid.appendChild(yearElement);
        }
    }

    isSameDay(date1, date2) {
        return date1.getDate() === date2.getDate() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getFullYear() === date2.getFullYear();
    }
    isCollapsed() {
        const calendar = document.querySelector('.calendar');
    const mainCalendar = document.querySelector('.main-calendar');
    const navigationBar = document.querySelector('.navigation-bar');

    calendar.classList.toggle('collapsed'); // Thêm/xóa class 'collapsed'
    
    // Ẩn hiện phần chính và navigation bar
    if (calendar.classList.contains('collapsed')) {
        mainCalendar.style.display = 'none';
        navigationBar.style.display = 'none';
    } else {
        mainCalendar.style.display = '';
        navigationBar.style.display = '';
    }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Calendar();
});
