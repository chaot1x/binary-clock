(function(window) {
    "use strict";

    function BinaryClock(element, options) {
        Object.assign(this.defaults, options);
        this.container = document.getElementById(element);
        this.start();
    }

    BinaryClock.prototype.defaults = {
        showWeekday: true,
        showDate: true,
        showTime: true,
        dateSuffix: true,
        showSeconds: true,
        showBinarySeconds: true,
        dateFormat: {
            en: '%month% %date%, %year%'
        },
        lang: 'en',
        fallbackLang: 'en',
        translations: {
            en: {
                weekdays: {
                    0: 'Sunday',
                    1: 'Monday',
                    2: 'Tuesday',
                    3: 'Wednesday',
                    4: 'Thursday',
                    5: 'Friday',
                    6: 'Saturday'
                },
                months: {
                    0: 'January',
                    1: 'February',
                    2: 'March',
                    3: 'April',
                    4: 'May',
                    5: 'June',
                    6: 'July',
                    7: 'August',
                    8: 'September',
                    9: 'October',
                    10: 'November',
                    11: 'December'
                },
                dateSuffix: {
                    st: 'st',
                    nd: 'nd',
                    rd: 'rd',
                    th: 'th'
                }
            }
        }
    };

    BinaryClock.prototype.splitToArray = function(array, string) {
        Array.prototype.forEach.call(string.split('.'), function(key) {
            if (typeof array !== "undefined") {
                array = array[key];
            }
        });

        return array;
    };

    BinaryClock.prototype.__ = function (key) {
        var self = this,
            translation = this.splitToArray(self.defaults.translations[self.defaults.lang], key);

        if (typeof translation === "undefined") {
            translation = this.splitToArray(self.defaults.translations[self.defaults.fallbackLang], key);

            if (typeof translation === "undefined") {
                return key;
            }
        }

        return translation;
    };

    BinaryClock.prototype.sprintf = function () {
        if (arguments.length >= 2) {
            var string = arguments[0].toString(),
                type = typeof arguments[1],
                args = (type === "string" || type === "number") ?
                Array.prototype.slice.call(arguments[1])
                : arguments[1];

            for (var key in args) {
                if (args.hasOwnProperty(key)) {
                    string = string.replace(new RegExp("\\%" + key + "\\%", "gi"), args[key]);
                }
            }

            return string;
        }
    };

    BinaryClock.prototype.update = function () {
        var $time = new Date(),
            $hours = $time.getHours(),
            $minutes = $time.getMinutes(),
            $seconds = $time.getSeconds(),
            $day = $time.getDay(),
            $date = $time.getDate(),
            $month = $time.getMonth(),
            $year = $time.getFullYear();

        this.tick('h1', Math.floor($hours / 10));
        this.tick('h2', $hours % 10);
        this.tick('m1', Math.floor($minutes / 10));
        this.tick('m2', $minutes % 10);

        if (this.defaults.showBinarySeconds === true) {
            this.tick('s1', Math.floor($seconds / 10));
            this.tick('s2', $seconds % 10);
        }

        if ($hours < 10) {
            $hours = '0' + $hours;
        }

        if ($minutes < 10) {
            $minutes = '0' + $minutes;
        }

        if ($seconds < 10) {
            $seconds = '0' + $seconds;
        }

        if (this.defaults.showWeekday === true ||
            this.defaults.showDate === true)
        {
            var $dateRow = this.container.getElementsByClassName('date-row')[0];

            if (this.defaults.showWeekday === true) {
                $dateRow.getElementsByClassName('weekday')[0].innerHTML = this.__('weekdays.' + $day);
            }

            if (this.defaults.showDate === true) {
                var $dateFormat = this.defaults.dateFormat[this.defaults.lang];
                $dateRow.getElementsByClassName('date')[0].innerHTML = this.sprintf($dateFormat, {
                    date: this.ordinalSuffix($date),
                    month: this.__('months.' + $month),
                    year: $year
                });
            }
        }

        if (this.defaults.showTime === true) {
            this.container.getElementsByClassName('time-row')[0].innerHTML = $hours + ':' + $minutes +
                (this.defaults.showSeconds === true ? ':' + $seconds : '');
        }

    };

    BinaryClock.prototype.init = function () {
        this.container.innerHTML = '<div class="binary-clock">' +
            this.dateWrapper() +
            this.binaryWrapper() +
            this.timeWrapper() +
            '</div>';
    };

    BinaryClock.prototype.start = function () {
        this.init();
        this.update();
        this.timer = setInterval(this.update.bind(this), 500);
    };

    BinaryClock.prototype.stop = function () {
        clearInterval(this.timer);
    };

    BinaryClock.prototype.ordinalSuffix = function (number) {
        var i = number % 10,
            n = number % 100;
        if (i === 1 && n !== 11) {
            return number + this.__('dateSuffix.st');
        }

        if (i === 2 && n !== 12) {
            return number + this.__('dateSuffix.nd');
        }

        if (i === 3 && n !== 13) {
            return number + this.__('dateSuffix.rd');
        }

        return number + this.__('dateSuffix.th');
    };

    BinaryClock.prototype.tick = function (element, value) {
        var $column = this.container.getElementsByClassName(element)[0],
            $ticks = $column.getElementsByClassName('tick');

        Array.prototype.forEach.call($ticks, function (tick) {
            if (tick.classList.contains('active')) {
                tick.classList.remove('active');
            }

            if ([1, 3, 5, 7, 9].indexOf(value) > -1 &&
                tick.classList.contains('tick-1')) {
                tick.classList.add('active');
            }

            if ([2, 3, 6, 7].indexOf(value) > -1 &&
                tick.classList.contains('tick-2')) {
                tick.classList.add('active');
            }

            if ([4, 5, 6, 7].indexOf(value) > -1 &&
                tick.classList.contains('tick-4')) {
                tick.classList.add('active');
            }

            if ([8, 9].indexOf(value) > -1 &&
                tick.classList.contains('tick-8')) {
                tick.classList.add('active');
            }
        });
    };

    BinaryClock.prototype.clockTicks = function (ticks) {
        ticks = ticks || 2;

        if (isNaN(ticks) || ticks < 2) {
            ticks = 2;
        } else if (ticks > 4) {
            ticks = 4;
        }

        var $html = '';

        for (var i = ticks; i >= 1; i--) {
            $html += '<span class="tick tick-' + Math.pow(2, (i - 1)) + '"></span>';
        }

        return $html;
    };

    BinaryClock.prototype.hoursWrapper = function () {
        return '<div class="hours-row">' +
            '<div class="h1">' +
            this.clockTicks(2) +
            '</div>' +
            '<div class="h2">' +
            this.clockTicks(4) +
            '</div>' +
            '</div>';
    };

    BinaryClock.prototype.minutesWrapper = function () {
        return '<div class="minutes-row">' +
            '<div class="m1">' +
            this.clockTicks(3) +
            '</div>' +
            '<div class="m2">' +
            this.clockTicks(4) +
            '</div>' +
            '</div>';
    };

    BinaryClock.prototype.secondsWrapper = function () {
        return '<div class="seconds-row">' +
            '<div class="s1">' +
            this.clockTicks(3) +
            '</div>' +
            '<div class="s2">' +
            this.clockTicks(4) +
            '</div>' +
            '</div>';
    };

    BinaryClock.prototype.binaryWrapper = function () {
        return '<div class="binary-row">' +
            this.hoursWrapper() +
            this.minutesWrapper() +
            (this.defaults.showBinarySeconds === true ? this.secondsWrapper() : '') +
            '</div>';
    };

    BinaryClock.prototype.dateWrapper = function () {
        var $html = '';

        if (this.defaults.showWeekday === true ||
            this.defaults.showDate === true)
        {
            $html += '<div class="date-row">';
            if (this.defaults.showWeekday === true) {
                $html += '<div class="weekday"></div>';
            }
            if (this.defaults.showDate === true) {
                $html += '<div class="date"></div>';
            }
            $html += '</div>';
        }

        return $html;
    };

    BinaryClock.prototype.timeWrapper = function () {
        if (this.defaults.showTime === true) {
            return '<div class="time-row"></div>';
        }

        return '';
    };

    window.BinaryClock = BinaryClock;
})(window);