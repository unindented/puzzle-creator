var __bind = function(func, context) {
    return function(){ return func.apply(context, arguments); };
  };
(function($) {
  var Timer;
  $.fn.puzzle = function(settings) {
    var MAX_COLS, MAX_ROWS, MIN_COLS, MIN_HEIGHT, MIN_ROUNDS, MIN_ROWS, MIN_SPEED, MIN_WIDTH, animation, checkOrder, checkSolution, cols, control, defaults, getBorderWidth, getLinearPosition, getMatrixPosition, hole, rows, style, success, texts;
    MIN_WIDTH = 32;
    MIN_HEIGHT = 32;
    MIN_ROWS = 3;
    MAX_ROWS = 9;
    MIN_COLS = 3;
    MAX_COLS = 9;
    MIN_SPEED = 1;
    MIN_ROUNDS = 1;
    defaults = {
      rows: 4,
      cols: 4,
      hole: 16,
      shuffle: false,
      numbers: false,
      control: {
        shufflePieces: true,
        confirmShuffle: true,
        toggleNumbers: true,
        toggleOriginal: true,
        counter: true,
        timer: true,
        pauseTimer: false
      },
      success: {
        fadeOriginal: true,
        callback: undefined,
        callbackTimeout: 300
      },
      animation: {
        shuffleRounds: 3,
        shuffleSpeed: 800,
        slidingSpeed: 200,
        fadeOriginalSpeed: 600
      },
      style: {
        gridSize: 2,
        gridOverlap: true,
        backgroundOpacity: 0.1
      }
    };
    texts = {
      shufflePieces: chrome.i18n.getMessage('msg_shuffle'),
      confirmShuffle: chrome.i18n.getMessage('msg_confirm_shuffle'),
      toggleNumbers: chrome.i18n.getMessage('msg_numbers'),
      toggleOriginal: chrome.i18n.getMessage('msg_original'),
      moves: chrome.i18n.getMessage('msg_moves'),
      seconds: chrome.i18n.getMessage('msg_seconds')
    };
    if (settings && !settings.hole && (settings.rows || settings.cols)) {
      settings.hole = (settings.rows || defaults.rows) * (settings.cols || defaults.cols);
    }
    settings = $.extend(true, {}, defaults, settings);
    rows = settings.rows;
    cols = settings.cols;
    hole = settings.hole;
    control = settings.control;
    success = settings.success;
    animation = settings.animation;
    style = settings.style;
    if (rows < MIN_ROWS || rows > MAX_ROWS) {
      rows = defaults.rows;
    }
    if (cols < MIN_COLS || cols > MAX_COLS) {
      cols = defaults.rows;
    }
    if (hole < 1 || hole > rows * cols) {
      hole = rows * cols;
    }
    hole--;
    if (animation.slidingSpeed < MIN_SPEED) {
      animation.slidingSpeed = MIN_SPEED;
    }
    if (animation.shuffleSpeed < MIN_SPEED) {
      animation.shuffleSpeed = MIN_SPEED;
    }
    if (animation.fadeOriginalSpeed < MIN_SPEED) {
      animation.fadeOriginalSpeed = MIN_SPEED;
    }
    if (animation.shuffleRounds < MIN_ROUNDS) {
      animation.shuffleRounds = MIN_ROUNDS;
    }
    checkSolution = function($pieces) {
      var _ref, currPos, i, pieceIndex;
      _ref = $pieces.length;
      for (i = 0; (0 <= _ref ? i < _ref : i > _ref); (0 <= _ref ? i += 1 : i -= 1)) {
        pieceIndex = i < hole ? i : i + 1;
        currPos = parseInt($pieces.eq(i).attr('current'));
        if (pieceIndex !== currPos) {
          return false;
        }
      }
      return true;
    };
    checkOrder = function(numbersArray) {
      var _ref, _ref2, _ref3, i, j, product;
      product = 1;
      _ref = rows * cols - 1;
      for (i = 1; (1 <= _ref ? i <= _ref : i >= _ref); (1 <= _ref ? i += 1 : i -= 1)) {
        _ref2 = i + 1; _ref3 = rows * cols;
        for (j = _ref2; (_ref2 <= _ref3 ? j <= _ref3 : j >= _ref3); (_ref2 <= _ref3 ? j += 1 : j -= 1)) {
          product *= (numbersArray[i - 1] - numbersArray[j - 1]) / (i - j);
        }
      }
      return Math.round(product) === 1;
    };
    getLinearPosition = function(row, col) {
      return parseInt(row) * cols + parseInt(col);
    };
    getMatrixPosition = function(index) {
      return {
        row: Math.floor(index / cols),
        col: index % cols
      };
    };
    getBorderWidth = function($element) {
      var property;
      property = $element.css('border-left-width');
      if ($element.css('border-left-style') !== 'none') {
        switch (property) {
          case 'thin':
            return 2;
          case 'medium':
            return 4;
          case 'thick':
            return 6;
          default:
            return parseInt(property) || 0;
        }
      }
      return 0;
    };
    return this.filter('img').each(function() {
      var $dummyBackground, $dummyGui, $dummyPiece, $dummyWrapper, $srcImg, computedStyles, currHole, interval, lock, moves, seconds, shuffled, solved, timer;
      $srcImg = $(this);
      lock = false;
      solved = false;
      shuffled = settings.shuffle;
      moves = 0;
      seconds = 0;
      timer = undefined;
      currHole = hole;
      $dummyWrapper = $('<div/>').addClass('wrapper').append($dummyPiece);
      $dummyBackground = $('<div/>').addClass('background').appendTo($dummyWrapper);
      $dummyPiece = $('<div/>').addClass('piece').appendTo($dummyWrapper);
      $dummyGui = $('<div/>').attr('class', $srcImg.attr('class') || '').addClass('puzzle').append($dummyWrapper);
      $srcImg.replaceWith($dummyGui);
      $dummyGui.attr('id', $srcImg.attr('id') || '');
      computedStyles = {
        gui: {
          border: getBorderWidth($dummyGui),
          padding: {
            left: parseInt($dummyGui.css('padding-left')) || 0,
            right: parseInt($dummyGui.css('padding-right')) || 0,
            top: parseInt($dummyGui.css('padding-top')) || 0,
            bottom: parseInt($dummyGui.css('padding-bottom')) || 0
          }
        },
        wrapper: {
          border: getBorderWidth($dummyWrapper),
          padding: parseInt($dummyWrapper.css('padding-left')) || 0
        },
        background: {
          border: getBorderWidth($dummyBackground)
        },
        piece: {
          border: getBorderWidth($dummyPiece)
        }
      };
      $dummyGui.removeAttr('id');
      $dummyGui.replaceWith($srcImg);
      $srcImg.one('load', function() {
        var $background, $buttonPanel, $buttons, $controls, $counter, $counterField, $displayPanel, $gui, $numbersButton, $originalButton, $pieces, $protoButton, $protoField, $protoPiece, $shuffleButton, $timer, $timerField, $wrapper, bgLeft, bgTop, coveredHeight, coveredWidth, finishGame, fullHeight, fullWidth, getOffset, height, i, id, imgSrc, index, j, offset, overlap, shuffle, solutionCallback, totalPieceHeight, totalPieceWidth, width;
        overlap = style.gridSize === 0 && style.gridOverlap;
        coveredWidth = cols * (2 * computedStyles.piece.border) + (cols - 1) * style.gridSize;
        coveredHeight = rows * (2 * computedStyles.piece.border) + (rows - 1) * style.gridSize;
        if (overlap) {
          coveredWidth -= (cols - 1) * computedStyles.piece.border;
          coveredHeight -= (rows - 1) * computedStyles.piece.border;
        }
        $srcImg.css({
          height: 'auto',
          width: 'auto',
          visibility: 'visible'
        });
        width = Math.floor(($srcImg.width() - coveredWidth) / cols);
        height = Math.floor(($srcImg.height() - coveredHeight) / rows);
        fullWidth = cols * width + coveredWidth;
        fullHeight = rows * height + coveredHeight;
        imgSrc = $srcImg.attr('src');
        totalPieceWidth = width + (2 * computedStyles.piece.border) + style.gridSize;
        totalPieceHeight = height + (2 * computedStyles.piece.border) + style.gridSize;
        getOffset = function(row, col) {
          var offset;
          offset = {
            left: computedStyles.wrapper.padding + (col * totalPieceWidth),
            top: computedStyles.wrapper.padding + (row * totalPieceHeight)
          };
          if (overlap) {
            offset.left -= col * computedStyles.piece.border;
            offset.top -= row * computedStyles.piece.border;
          }
          return offset;
        };
        shuffle = function(rounds, speed) {
          var $piece, _i, _j, _ref, _result, animCounter, choices, i, j, lastRound, offset, pieceIndex, randomIndex, shuffles, target;
          if (speed) {
            if ($shuffleButton.is('.disabled')) {
              return false;
            }
            if (lock) {
              return false;
            }
            if (moves > 0 && control.confirmShuffle && !window.confirm(texts.confirmShuffle)) {
              return false;
            }
            lock = true;
            if (solved) {
              $gui.removeClass('solved');
              $background.fadeTo(animation.fadeOriginalSpeed, style.backgroundOpacity, function() {
                $background.remove().prependTo($wrapper);
                return $buttons.removeClass('disabled');
              });
            }
          }
          if (timer) {
            timer.stop();
          }
          solved = false;
          shuffled = true;
          moves = 0;
          seconds = 0;
          if ($displayPanel) {
            $displayPanel.removeClass('disabled');
          }
          if ($counter) {
            $counter.val(moves);
          }
          if ($timer) {
            $timer.val(seconds);
          }
          shuffles = [];
          i = 0;
          while (i < rounds) {
            choices = [];
            _ref = rows * cols;
            for (j = 0; (0 <= _ref ? j < _ref : j > _ref); (0 <= _ref ? j += 1 : j -= 1)) {
              choices[j] = j;
            }
            choices.splice(hole, 1);
            shuffles[i] = [];
            _ref = rows * cols;
            for (j = 0; (0 <= _ref ? j < _ref : j > _ref); (0 <= _ref ? j += 1 : j -= 1)) {
              if (j === hole) {
                shuffles[i][j] = hole;
                continue;
              }
              randomIndex = Math.floor(Math.random() * choices.length);
              shuffles[i][j] = choices[randomIndex];
              choices.splice(randomIndex, 1);
            }
            if ((i + 1) < rounds || checkOrder(shuffles[i])) {
              i++;
            }
          }
          animCounter = 0;
          _result = [];
          for (_i = 0; (0 <= rounds ? _i < rounds : _i > rounds); (0 <= rounds ? _i += 1 : _i -= 1)) {
            var i = _i;
            lastRound = (i + 1) === rounds;
            _ref = shuffles[i].length;
            for (_j = 0; (0 <= _ref ? _j < _ref : _j > _ref); (0 <= _ref ? _j += 1 : _j -= 1)) {
              var j = _j;
              if (j === hole) {
                if (lastRound) {
                  currHole = hole;
                }
                continue;
              }
              pieceIndex = shuffles[i][j];
              if (pieceIndex > hole) {
                pieceIndex -= 1;
              }
              $piece = $pieces.eq(pieceIndex);
              target = getMatrixPosition(j);
              offset = getOffset(target.row, target.col);
              if (lastRound) {
                $piece.attr('current', j);
              }
              if (!(speed != null)) {
                $piece.css({
                  left: offset.left,
                  top: offset.top
                });
              } else {
                $piece.animate({
                  left: offset.left,
                  top: offset.top
                }, speed, null, function() {
                  animCounter++;
                  if (animCounter === animation.shuffleRounds * (rows * cols - 1)) {
                    lock = false;
                    return (animCounter = 0);
                  }
                });
              }
            }
          }
          return _result;
        };
        $wrapper = $('<div/>').addClass('wrapper').css({
          width: fullWidth,
          height: fullHeight,
          borderWidth: computedStyles.wrapper.border,
          padding: computedStyles.wrapper.padding,
          position: 'relative',
          overflow: 'hidden'
        });
        $protoPiece = $('<div/>').addClass('piece').css({
          width: width,
          height: height,
          backgroundImage: ("url(" + (imgSrc) + ")"),
          borderWidth: computedStyles.piece.border,
          position: 'absolute',
          overflow: 'hidden'
        }).append($('<span/>').addClass('number'));
        $pieces = $([]);
        for (i = 0; (0 <= rows ? i < rows : i > rows); (0 <= rows ? i += 1 : i -= 1)) {
          for (j = 0; (0 <= cols ? j < cols : j > cols); (0 <= cols ? j += 1 : j -= 1)) {
            index = getLinearPosition(i, j);
            if (index === hole) {
              continue;
            }
            offset = getOffset(i, j);
            bgLeft = -1 * (j * totalPieceWidth + computedStyles.piece.border);
            bgTop = -1 * (i * totalPieceHeight + computedStyles.piece.border);
            if (overlap) {
              bgLeft += j * computedStyles.piece.border;
              bgTop += i * computedStyles.piece.border;
            }
            $pieces = $pieces.add($protoPiece.clone().css({
              left: offset.left,
              top: offset.top,
              backgroundPosition: ("" + (bgLeft) + "px " + (bgTop) + "px")
            }).attr('current', index).appendTo($wrapper).children().text(index + 1).end());
          }
        }
        if (settings.shuffle) {
          shuffle(1);
        }
        $background = $('<div/>').addClass('background').css({
          width: fullWidth,
          height: fullHeight,
          left: computedStyles.wrapper.padding - computedStyles.background.border,
          top: computedStyles.wrapper.padding - computedStyles.background.border,
          backgroundImage: ("url(" + (imgSrc) + ")"),
          position: 'absolute',
          opacity: style.backgroundOpacity
        }).prependTo($wrapper);
        $controls = $('<div/>').addClass('controls').css({
          padding: computedStyles.wrapper.padding
        });
        $buttonPanel = undefined;
        $shuffleButton = undefined;
        $numbersButton = undefined;
        $originalButton = undefined;
        if (control.shufflePieces || control.toggleNumbers || control.toggleOriginal) {
          $buttonPanel = $('<div/>').addClass('buttons').appendTo($controls);
          $protoButton = $('<a/>');
          if (control.shufflePieces) {
            $shuffleButton = $protoButton.clone().addClass('shuffle').text(texts.shufflePieces).appendTo($buttonPanel);
          }
          if (control.toggleNumbers) {
            $numbersButton = $protoButton.clone().addClass('numbers').text(texts.toggleNumbers).appendTo($buttonPanel);
            if (settings.numbers) {
              $numbersButton.addClass('toggle');
            }
          }
          if (control.toggleOriginal) {
            $originalButton = $protoButton.clone().addClass('original').text(texts.toggleOriginal).appendTo($buttonPanel);
          }
          $buttons = $buttonPanel.children();
        }
        $displayPanel = undefined;
        $counterField = undefined;
        $timerField = undefined;
        if (control.counter || control.timer) {
          $displayPanel = $('<div/>').addClass('display').appendTo($controls);
          $protoField = $('<input/>').attr('readonly', 'readonly').val(0);
          if (control.counter) {
            $counter = $protoField.clone().appendTo($displayPanel).after(texts.moves);
          }
          if (control.timer) {
            $timer = $protoField.clone().appendTo($displayPanel).after(texts.seconds);
          }
          if (!settings.shuffle) {
            $displayPanel.addClass('disabled');
          }
        }
        $gui = $('<div/>').attr('class', $srcImg.attr('class') || '').addClass('puzzle').css({
          width: fullWidth + 2 * (computedStyles.wrapper.padding + computedStyles.wrapper.border),
          overflow: 'hidden'
        }).append($wrapper).append($controls);
        $srcImg.replaceWith($gui);
        id = $srcImg.attr('id');
        if (id) {
          $gui.attr('id', id);
        }
        if (!settings.numbers) {
          $pieces.children().hide();
        }
        $gui.mousedown(function() {
          return false;
        });
        $buttons.mousedown(function() {
          return !$(this).is('.disabled') ? $(this).addClass('down') : undefined;
        });
        $buttons.mouseout(function() {
          return $(this).removeClass('down');
        });
        $buttons.mouseup(function() {
          return $(this).removeClass('down');
        });
        $pieces.click(function() {
          var $piece, current, dest, source;
          if (lock) {
            return false;
          }
          if (solved) {
            return false;
          }
          lock = true;
          $piece = $(this);
          current = $piece.attr('current');
          source = getMatrixPosition(current);
          dest = getMatrixPosition(currHole);
          if (Math.abs(source.row - dest.row) + Math.abs(source.col - dest.col) !== 1) {
            lock = false;
            return false;
          }
          offset = getOffset(dest.row, dest.col);
          $piece.attr('current', currHole);
          currHole = current;
          if (shuffled) {
            moves++;
          }
          if ($counter) {
            $counter.val(moves);
          }
          if (moves === 1) {
            if (!timer) {
              timer = new Timer(333, function(ms) {
                seconds = Math.floor(ms / 1000);
                return $timer ? $timer.val(seconds) : undefined;
              });
            }
            timer.start();
          }
          return $piece.animate({
            left: offset.left,
            top: offset.top
          }, animation.slidingSpeed, null, function() {
            if (shuffled) {
              solved = checkSolution($pieces);
              if (solved) {
                if (timer) {
                  timer.stop();
                }
                shuffled = false;
                $gui.addClass('solved');
                return window.setTimeout(finishGame, 100);
              } else {
                return (lock = false);
              }
            } else {
              return (lock = false);
            }
          });
        });
        if (control.shufflePieces) {
          $shuffleButton.click(function() {
            return shuffle(animation.shuffleRounds, animation.shuffleSpeed);
          });
        }
        if (control.toggleNumbers) {
          $numbersButton.click(function() {
            if ($numbersButton.is('.disabled')) {
              return false;
            }
            if ($numbersButton.is('.toggle')) {
              $numbersButton.removeClass('toggle');
              return $pieces.children().hide();
            } else {
              $numbersButton.addClass('toggle');
              return $pieces.children().show();
            }
          });
        }
        if (control.toggleOriginal) {
          $originalButton.click(function() {
            if ($originalButton.is('.disabled')) {
              return false;
            }
            if (lock) {
              return false;
            }
            lock = true;
            if ($originalButton.is('.toggle')) {
              if (control.shufflePieces) {
                $shuffleButton.removeClass('disabled');
              }
              if (control.toggleNumbers) {
                $numbersButton.removeClass('disabled');
              }
              $originalButton.removeClass('toggle');
              $background.fadeTo(animation.fadeOriginalSpeed, style.backgroundOpacity, function() {
                $(this).prependTo($wrapper);
                if (control.pauseTimer && timer) {
                  timer.resume();
                }
                return (lock = false);
              });
            } else {
              if (control.shufflePieces) {
                $shuffleButton.addClass('disabled');
              }
              if (control.toggleNumbers) {
                $numbersButton.addClass('disabled');
              }
              $originalButton.addClass('toggle');
              if (control.pauseTimer && timer) {
                timer.pause();
              }
              $background.appendTo($wrapper).fadeTo(animation.fadeOriginalSpeed, 1.0, function() {
                return (lock = false);
              });
            }
            return false;
          });
        }
        finishGame = function() {
          if (success.fadeOriginal) {
            if (control.toggleOriginal) {
              $originalButton.addClass('disabled');
            }
            if (control.toggleNumbers) {
              $numbersButton.addClass('disabled');
            }
            return $background.appendTo($wrapper).fadeTo(animation.fadeOriginalSpeed, 1.0, function() {
              lock = false;
              return solutionCallback();
            });
          } else {
            lock = false;
            return solutionCallback();
          }
        };
        return (solutionCallback = function() {
          return $.isFunction(success.callback) ? setTimeout(function() {
            return success.callback({
              moves: moves,
              seconds: seconds
            });
          }, success.callbackTimeout) : undefined;
        });
      });
      return (interval = setInterval(function() {
        if ($srcImg[0].complete) {
          clearInterval(interval);
          return $srcImg.trigger('load');
        }
      }, 333));
    }).end();
  };
  $(document).ready(function() {
    return $('img.puzzle').each(function() {
      return $(this).puzzle();
    });
  });
  Timer = function(interval, callback) {
    this.interval = interval;
    this.callback = callback;
    this.timeout = undefined;
    this.startTime = undefined;
    this.startPauseTime = undefined;
    this.totalPause = 0;
    return this;
  };
  Timer.prototype.run = function() {
    this.update(new Date().getTime());
    return (this.timeout = setTimeout((__bind(function() {
      return this.run();
    }, this)), this.interval));
  };
  Timer.prototype.update = function(now) {
    return this.callback(now - this.totalPause - this.startTime);
  };
  Timer.prototype.start = function() {
    if (this.startTime != null) {
      return false;
    }
    this.startTime = new Date().getTime();
    return this.run();
  };
  Timer.prototype.stop = function() {
    var now;
    if (!(this.startTime != null)) {
      return false;
    }
    clearTimeout(this.timeout);
    now = new Date().getTime();
    if (this.startPauseTime != null) {
      this.totalPause += now - this.startPauseTime;
    }
    this.update(now);
    this.startTime = undefined;
    this.startPauseTime = undefined;
    return (this.totalPause = 0);
  };
  Timer.prototype.pause = function() {
    if (!(this.startTime != null) || (this.startPauseTime != null)) {
      return false;
    }
    clearTimeout(this.timeout);
    return (this.startPauseTime = new Date().getTime());
  };
  Timer.prototype.resume = function() {
    if (!(this.startPauseTime != null)) {
      return false;
    }
    this.totalPause += new Date().getTime() - this.startPauseTime;
    this.startPauseTime = undefined;
    return this.run();
  };
  return Timer;
})(jQuery);