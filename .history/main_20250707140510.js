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

        this.initializeCalendar();
    }

    initializeCalendar() {
        this.bindUIEvents();
        this.renderCalendar();
        this.startClockUpdate();
    }

    bindUIEvents() {
        document.getElementById('dateText').addEventListener('click', () => this.goToTodayMonthView());
        document.querySelector('.dropdown-icon').addEventListener('click', () => this.toggleCollapseCalendar());
        document.getElementById('calendarTitle').addEventListener('click', () => this.switchViewMode());

        const arrows = document.querySelectorAll('.arrow-controls span');
        if (arrows.length >= 2) {
            arrows[0].addEventListener('click', () => this.navigateCalendar(-1)); 
            arrows[1].addEventListener('click', () => this.navigateCalendar(1));
        }

        document.getElementById('minusTime').addEventListener('click', () => this.adjustFocusTime(-5));
        document.getElementById('plusTime').addEventListener('click', () => this.adjustFocusTime(15));
        document.getElementById('startBtn').addEventListener('click', () => this.toggleFocusSession());
    }

    adjustFocusTime(minutes) {
        this.timeMinutes += minutes;
        if (this.timeMinutes < 5) this.timeMinutes = 5;
        if (this.timeMinutes > 480) this.timeMinutes = 480;
        this.renderFocusTimeLabel();
    }

    renderFocusTimeLabel() {
        const timeLabel = document.getElementById('durationLabel');
        timeLabel.textContent = `${this.timeMinutes} mins`;
    }

    toggleFocusSession() {
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
                this.renderCountdownTime();

                if (this.remainingSeconds <= 0) {
                    clearInterval(this.focusInterval);
                    this.focusInterval = null;
                    alert("Time's up!");
                    this.resetFocusUI();
                }
            }, 1000);
        } else {
            clearInterval(this.focusInterval);
            this.focusInterval = null;
            this.resetFocusUI();
            this.renderFocusTimeLabel(); 
        }
    }

    renderCountdownTime() {
        const timeLabel = document.getElementById('durationLabel');
        const minutes = Math.floor(this.remainingSeconds / 60);
        const seconds = this.remainingSeconds % 60;
        timeLabel.textContent = `${minutes}m ${seconds}s`;
    }

    resetFocusUI() {
        const focusBtn = document.getElementById('startBtn');
        const icon = focusBtn.querySelector('.session-icon');
        const text = focusBtn.querySelector('span:last-child');

        text.textContent = 'Focus';
        icon.textContent = '\u25B6';
        focusBtn.style.color = '#888888';
    }

    startClockUpdate() {
        setInterval(() => {
            this.currentDate = new Date();
            this.renderCurrentDateHeader();
        }, 1000);
    }

    goToTodayMonthView() {
        this.viewMode = 'month';
        this.currentMonth = new Date(this.currentDate);    
        this.selectedDate = new Date(this.currentDate); 
        this.renderCalendar();
    }

    switchViewMode() {
        switch (this.viewMode) {
            case 'month':
                this.viewMode = 'year';
                break;
            case 'year':
                this.viewMode = 'decade';
                break;
        }
        this.renderCalendar();
    }

    navigateCalendar(direction) {
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
        this.renderCalendar();
    }

    renderCalendar() {
        this.renderCurrentDateHeader();
        this.renderNavigationTitle();
        this.renderGridContent();
        this.toggleWeekdayHeader();
        this.renderFocusTimeLabel();
    }

    renderCurrentDateHeader() {
        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        const dateText = this.currentDate.toLocaleDateString('en-US', options);
        document.getElementById('dateText').textContent = dateText;
    }

    renderNavigationTitle() {
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

    toggleWeekdayHeader() {
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

    renderGridContent() {
        const grid = document.getElementById('gridContainer');
        grid.innerHTML = '';

        switch (this.viewMode) {
            case 'month':
                this.renderMonthGrid(grid);
                break;
            case 'year':
                this.renderYearGrid(grid);
                break;
            case 'decade':
                this.renderDecadeGrid(grid);
                break;
        }
    }

    renderMonthGrid(grid) {
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

            if (this.isEqualDay(date, this.currentDate)) dayElement.classList.add('today');
            if (this.isEqualDay(date, this.selectedDate)) dayElement.classList.add('selected');

            dayElement.addEventListener('click', () => {
                this.selectedDate = new Date(date);
                this.renderCalendar();
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

    renderYearGrid(grid) {
        for (let month = 0; month < 12; month++) {
            const monthElement = document.createElement('div');
            monthElement.className = 'year-cell';
            monthElement.textContent = this.monthsShort[month];

            if (month === this.currentDate.getMonth() && this.currentMonth.getFullYear() === this.currentDate.getFullYear()) {
                monthElement.classList.add('current');
            }
            if (month === this.currentMonth.getMonth()) {
                monthElement.classList.add('selected');
            }

            monthElement.addEventListener('click', () => {
                this.currentMonth.setMonth(month);
                this.viewMode = 'month';
                this.renderCalendar();
            });

            grid.appendChild(monthElement);
        }
    }

    renderDecadeGrid(grid) {
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
                this.renderCalendar();
            });

            grid.appendChild(yearElement);
        }
    }

    isEqualDay(date1, date2) {
        return date1.getDate() === date2.getDate() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getFullYear() === date2.getFullYear();
    }

    toggleCollapseCalendar() {
        const calendar = document.querySelector('.calendar');
        const mainCalendar = document.querySelector('.main-calendar');
        const navigationBar = document.querySelector('.navigation-bar');
        const dropdownIcon = document.getElementById('dropdownIcon');

        calendar.classList.toggle('collapsed');

        if (calendar.classList.contains('collapsed')) {
            mainCalendar.style.display = 'none';
            navigationBar.style.display = 'none';

            if (dropdownIcon.tagName === 'I') {
                dropdownIcon.classList.remove('fa-chevron-down');
                dropdownIcon.classList.add('fa-chevron-up');
            } else {
                dropdownIcon.textContent = '▲';
            }
        } else {
            mainCalendar.style.display = '';
            navigationBar.style.display = '';

            if (dropdownIcon.tagName === 'I') {
                dropdownIcon.classList.remove('fa-chevron-up');
                dropdownIcon.classList.add('fa-chevron-down');
            } else {
                dropdownIcon.textContent = '▼';
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Calendar();
});
