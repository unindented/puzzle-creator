(($) ->
  $.fn.puzzle = (settings) ->

    MIN_WIDTH  = 32
    MIN_HEIGHT = 32

    MIN_ROWS   = 3
    MAX_ROWS   = 9

    MIN_COLS   = 3
    MAX_COLS   = 9

    MIN_SPEED  = 1
    MIN_ROUNDS = 1

    # default settings
    defaults =

      rows: 4         # number of rows [3 ... 9]
      cols: 4         # number of columns [3 ... 9]
      hole: 16        # initial hole position [1 ... rows * columns]
      shuffle: false  # initially show shuffled pieces [true | false]
      numbers: false  # initially show numbers on pieces [true | false]

      # display additional gui controls
      control:
        shufflePieces:  true   # display 'Shuffle' button [true | false]
        confirmShuffle: true   # ask before shuffling [true | false]
        toggleNumbers:  true   # display 'Numbers' button [true | false]
        toggleOriginal: true   # display 'Original' button [true | false]
        counter:        true   # display moves counter [true | false]
        timer:          true   # display timer (seconds) [true | false]
        pauseTimer:     false  # pause timer if 'Original' button is activated [true | false]

      # perform actions when the puzzle is solved sucessfully
      success:
        fadeOriginal:    true       # cross-fade original image [true | false]
        callback:        undefined  # callback a user-defined function [function]
        callbackTimeout: 300        # time in ms after which the callback is called

      # animation speeds and settings
      animation:
        shuffleRounds:     3    # number of shuffle rounds [1 ... ]
        shuffleSpeed:      800  # time in ms to perform a shuffle round
        slidingSpeed:      200  # time in ms for a single move
        fadeOriginalSpeed: 600  # time in ms to cross-fade original image

      # additional style information not specified via css
      style:
        gridSize:          2     # space in px between two pieces
        gridOverlap:       true  # overlap adjacent piece borders (only if gridSize is set to 0)
        backgroundOpacity: 0.1   # opacity of the original image behind the pieces [0 ... 1]

    # language localizations
    texts =
      shufflePieces:  chrome.i18n.getMessage('msg_shuffle')
      confirmShuffle: chrome.i18n.getMessage('msg_confirm_shuffle')
      toggleNumbers:  chrome.i18n.getMessage('msg_numbers')
      toggleOriginal: chrome.i18n.getMessage('msg_original')
      moves:          chrome.i18n.getMessage('msg_moves')
      seconds:        chrome.i18n.getMessage('msg_seconds')

    # if rows or cols, but no hole was user-defined, explicitly set hole
    # position to last piece (bottom right)
    if settings and not settings.hole and (settings.rows or settings.cols)
      settings.hole = (settings.rows or defaults.rows) * (settings.cols or defaults.cols)

    # extend the user-defined settings object with default settings
    settings = $.extend(true, {}, defaults, settings)

    # create some handy shortcut variables
    rows      = settings.rows
    cols      = settings.cols
    hole      = settings.hole
    control   = settings.control
    success   = settings.success
    animation = settings.animation
    style     = settings.style

    # check settings for valid values

    # keep rows and columns within limits
    rows = defaults.rows if rows < MIN_ROWS or rows > MAX_ROWS
    cols = defaults.rows if cols < MIN_COLS or cols > MAX_COLS

    # keep hole position within limits
    hole = rows * cols if hole < 1 or hole > rows * cols
    hole-- # zero-based index

    # keep animation speed within limits
    animation.slidingSpeed      = MIN_SPEED if animation.slidingSpeed < MIN_SPEED
    animation.shuffleSpeed      = MIN_SPEED if animation.shuffleSpeed < MIN_SPEED
    animation.fadeOriginalSpeed = MIN_SPEED if animation.fadeOriginalSpeed < MIN_SPEED

    # keep shuffle rounds within limits
    animation.shuffleRounds     = MIN_ROUNDS if animation.shuffleRounds < MIN_ROUNDS


    # helper functions ---------------------------------------------------------

    # checks if the puzzle is solved
    checkSolution = ($pieces) ->
      # iterate over pieces and check each piece
      for i in [0 ... $pieces.length]
        # since the hole is not saved in the pieces array, adjust the index if
        # it is bejond the hole position
        pieceIndex = if i < hole then i else i + 1
        currPos = parseInt($pieces.eq(i).attr('current'))

        # check if current position match target (index) position
        return false if pieceIndex != currPos

      return true

    # checks if the puzzle can be solved
    checkOrder = (numbersArray) ->
      product = 1
      for i in [1 .. rows * cols - 1]
        for j in [i + 1 .. rows * cols]
          product *= (numbersArray[i - 1] - numbersArray[j - 1]) / (i - j)

      return Math.round(product) == 1

    # get the linear index from a row/col pair (zero-based)
    getLinearPosition = (row, col) ->
      return parseInt(row) * cols + parseInt(col)

    # get the row/col pair from a linear index (zero-based)
    getMatrixPosition = (index) ->
      return { row: Math.floor(index / cols), col: index % cols }

    # get the pixel width of a border
    getBorderWidth = ($element) ->
      # the reported css value
      property = $element.css('border-left-width')

      # a border style must be set to get a valid border width
      if $element.css('border-left-style') != 'none'
        switch property
          when 'thin'   then return 2
          when 'medium' then return 4
          when 'thick'  then return 6
          else return parseInt(property) or 0

      return 0


    # apply puzzle to each image element within selection ----------------------

    return this.filter('img').each((() ->
      $srcImg  = $(this)           # source image as jQuery object
      lock     = false             # flag if animations are running
      solved   = false             # flag if the puzzle is solved by the user
      shuffled = settings.shuffle  # flag if the puzzle was shuffled
      moves    = 0                 # counter for single moves
      seconds  = 0                 # counter for seconds after first move
      timer    = undefined         # a timer component

      # save the current hole position for further manipulation
      currHole = hole


      # create dummy elements to get computed css properties
      $dummyWrapper = $('<div/>')
        .addClass('wrapper')
        .append($dummyPiece)
      $dummyBackground = $('<div/>')
        .addClass('background')
        .appendTo($dummyWrapper)
      $dummyPiece = $('<div/>')
        .addClass('piece')
        .appendTo($dummyWrapper)
      $dummyGui = $('<div/>')
        .attr('class', $srcImg.attr('class') or '')
        .addClass('puzzle')
        .append($dummyWrapper)

      # replace original image with dummy
      $srcImg.replaceWith($dummyGui)

      # assign old image id to dummy
      $dummyGui.attr('id', $srcImg.attr('id') or '')

      # get computed css properties of dummy elements
      computedStyles =
        gui:
          border: getBorderWidth($dummyGui)
          padding:
            left:   parseInt($dummyGui.css('padding-left'))   or 0
            right:  parseInt($dummyGui.css('padding-right'))  or 0
            top:    parseInt($dummyGui.css('padding-top'))    or 0
            bottom: parseInt($dummyGui.css('padding-bottom')) or 0
        wrapper:
          border:  getBorderWidth($dummyWrapper)
          padding: parseInt($dummyWrapper.css('padding-left')) or 0
        background:
          border: getBorderWidth($dummyBackground)
        piece:
          border: getBorderWidth($dummyPiece)

      # re-replace dummy elements with original image
      $dummyGui.removeAttr('id')
      $dummyGui.replaceWith($srcImg)


      # wait for the image to be loaded, to be able to get its real width/height
      $srcImg.one('load', (() ->
        # overlap piece borders if there is no margin between pieces, so that
        # piece borders will not be doubled
        overlap = style.gridSize == 0 and style.gridOverlap

        # total space of piece borders and grid lines, which will cover parts of
        # the image
        coveredWidth  = cols * (2 * computedStyles.piece.border) + (cols - 1) * style.gridSize
        coveredHeight = rows * (2 * computedStyles.piece.border) + (rows - 1) * style.gridSize

        # recalc if overlap
        if overlap
          coveredWidth  -= (cols - 1) * computedStyles.piece.border
          coveredHeight -= (rows - 1) * computedStyles.piece.border

        # make sure to get the original image size, not scaled values
        $srcImg.css({ height: 'auto', width: 'auto', visibility: 'visible' })

        # pieces width and height, based on original image size
        width  = Math.floor(($srcImg.width() - coveredWidth) / cols)
        height = Math.floor(($srcImg.height() - coveredHeight) / rows)

        # reject too small images
        #return false if width < MIN_WIDTH or height < MIN_HEIGHT

        # recalc full image width and height to avoid rounding errors
        fullWidth  = cols * width + coveredWidth
        fullHeight = rows * height + coveredHeight

        # image source path
        imgSrc = $srcImg.attr('src')

        # total width/height of a piece (including piece border and grid size)
        totalPieceWidth  = width + (2 * computedStyles.piece.border) + style.gridSize
        totalPieceHeight = height + (2 * computedStyles.piece.border) + style.gridSize


        # helper functions -----------------------------------------------------

        # pixel offset of an element, based on matrix position
        getOffset = (row, col) ->
          offset =
            left: computedStyles.wrapper.padding + (col * totalPieceWidth)
            top:  computedStyles.wrapper.padding + (row * totalPieceHeight)

          if overlap
            offset.left -= col * computedStyles.piece.border
            offset.top  -= row * computedStyles.piece.border

          return offset

        # shuffle pieces
        shuffle = (rounds, speed) ->
          # when speed is defined, the function was triggered by a user event
          if speed
            # do nothing, if disabled
            return false if $shuffleButton.is('.disabled')

            # do nothing, if locked
            return false if lock

            # ask for confirmation
            return false if moves > 0 and control.confirmShuffle and not window.confirm(texts.confirmShuffle)

            lock = true # set lock

            # if the puzzle is solved
            if solved
              # reset gui
              $gui.removeClass('solved')

              # fade out original
              $background.fadeTo(animation.fadeOriginalSpeed, style.backgroundOpacity, (() ->
                $background.remove().prependTo($wrapper)
                # re-enable all buttons
                $buttons.removeClass('disabled')
              ))

          # stop the timer
          timer.stop() if timer

          # reset flag and counters
          solved   = false
          shuffled = true
          moves    = 0
          seconds  = 0

          # reset display
          $displayPanel.removeClass('disabled') if $displayPanel
          $counter.val(moves) if $counter
          $timer.val(seconds) if $timer

          shuffles = []
          i = 0
          # generate orders for several shuffle rounds
          while i < rounds
            # create an array for choosing random positions based on its length
            # we can select free positions
            choices = []
            for j in [0 ... rows * cols]
              choices[j] = j
            # remove element on initial hole position
            choices.splice(hole, 1)

            shuffles[i] = []
            # generate random numbers
            for j in [0 ... rows * cols]
              # but keep hole at initial position
              if j == hole
                shuffles[i][j] = hole
                continue

              # select a random position based on the length of the choices
              randomIndex = Math.floor(Math.random() * choices.length)

              # save the value at this index as the next number in the current order
              shuffles[i][j] = choices[randomIndex]

              # remove this value from the choices array (reducing its length)
              choices.splice(randomIndex, 1)

            # don't increase i if we are in last round and the generated order
            # is not solvable
            i++ if (i + 1) < rounds or checkOrder(shuffles[i])

          animCounter = 0 # animation counter for save unlock

          # shuffle pieces in several rounds
          for i in [0 ... rounds]

            # set flag for the last round
            lastRound = (i + 1) == rounds

            # iterate over the generated orders with j being the linear index
            # for the destination order
            for j in [0 ... shuffles[i].length]

              # we cannot move the hole
              if j == hole
                # update hole position
                currHole = hole if lastRound
                continue

              # the value is the index of the current piece in the original
              # ordered $pieces array
              pieceIndex = shuffles[i][j]

              # since the hole is not saved in the $pieces array, adjust the
              # index if it is bejond the hole position
              pieceIndex -= 1 if pieceIndex > hole

              # get the actual piece to be moved
              $piece = $pieces.eq(pieceIndex)

              # get target position
              target = getMatrixPosition(j)

              # get pixel offset new position
              offset = getOffset(target.row, target.col)

              # update current row/cal in last round
              $piece.attr('current', j) if lastRound

              # either just set or animate styles
              if not speed?
                $piece.css({ left: offset.left, top: offset.top })
              else
                # animate!
                $piece.animate({ left: offset.left, top: offset.top }, speed, null, (() ->
                  # unlock after last animation in last round
                  animCounter++
                  if animCounter == animation.shuffleRounds * (rows * cols - 1)
                    lock = false
                    animCounter = 0
                ))


        # create elements ------------------------------------------------------

        # create a wrapper for the pieces
        $wrapper = $('<div/>')
          .addClass('wrapper')
          .css({
            width:       fullWidth
            height:      fullHeight
            borderWidth: computedStyles.wrapper.border
            padding:     computedStyles.wrapper.padding
            position:    'relative'
            overflow:    'hidden'
          })

        # create a single piece prototype to be cloned for the actual pieces
        $protoPiece = $('<div/>')
          .addClass('piece')
          .css({
            width:           width
            height:          height
            backgroundImage: "url(#{imgSrc})"
            borderWidth:     computedStyles.piece.border
            position:        'absolute'
            overflow:        'hidden'
          })
          .append($('<span/>').addClass('number')) # will hold the numbers

        # create pieces inside wrapper
        $pieces = $([]) # create an empty jQuery object
        for i in [0 ... rows]
          for j in [0 ... cols]
            index = getLinearPosition(i,j) # linear index

            # do not create piece at initial hole position
            continue if index == hole

            # get piece position offset
            offset = getOffset(i,j)

            # calculate background offset
            bgLeft = -1 * (j * totalPieceWidth + computedStyles.piece.border)
            bgTop  = -1 * (i * totalPieceHeight + computedStyles.piece.border)

            # recalc if overlap
            if overlap
              bgLeft += j * computedStyles.piece.border
              bgTop  += i * computedStyles.piece.border

            # create single pieces from prototype
            $pieces = $pieces.add($protoPiece.clone()
              .css({
                left: offset.left
                top:  offset.top
                backgroundPosition: "#{bgLeft}px #{bgTop}px"
              })
              # add expando property to save the current position
              .attr('current', index)
              .appendTo($wrapper)
              # add number to inner span
              .children().text(index + 1).end()
            )

        # initially shuffle pieces
        shuffle(1) if settings.shuffle

        # create background (original image) inside wrapper
        $background = $('<div/>')
          .addClass('background')
          .css({
            width:           fullWidth
            height:          fullHeight
            left:            computedStyles.wrapper.padding - computedStyles.background.border
            top:             computedStyles.wrapper.padding - computedStyles.background.border
            backgroundImage: "url(#{imgSrc})"
            position:        'absolute'
            opacity:         style.backgroundOpacity
          })
          .prependTo($wrapper)

        # create controls which will hold the buttons and the display
        $controls = $('<div/>')
          .addClass('controls')
          .css({
            padding: computedStyles.wrapper.padding
          })

        $buttonPanel    = undefined

        $shuffleButton  = undefined
        $numbersButton  = undefined
        $originalButton = undefined

        if control.shufflePieces or control.toggleNumbers or control.toggleOriginal
          # create wrapper for buttons
          $buttonPanel = $('<div/>')
            .addClass('buttons')
            .appendTo($controls)

          # create a button prototype to be cloned for the actual buttons
          $protoButton = $('<a/>')

          # create shuffle button
          if control.shufflePieces
            $shuffleButton = $protoButton.clone()
              .addClass('shuffle')
              .text(texts.shufflePieces)
              .appendTo($buttonPanel)

          # create toggle numbers button
          if control.toggleNumbers
            $numbersButton = $protoButton.clone()
              .addClass('numbers')
              .text(texts.toggleNumbers)
              .appendTo($buttonPanel)
            # immediately toggle button, if numbers are initially shown
            $numbersButton.addClass('toggle') if settings.numbers

          # create toggle original button
          if control.toggleOriginal
            $originalButton = $protoButton.clone()
              .addClass('original')
              .text(texts.toggleOriginal)
              .appendTo($buttonPanel)

          # keep a reference to all buttons for convenience
          $buttons = $buttonPanel.children()

        $displayPanel = undefined

        $counterField = undefined
        $timerField   = undefined

        if control.counter or control.timer
          # create wrapper for counter/timer
          $displayPanel = $('<div/>')
            .addClass('display')
            .appendTo($controls)

          # create a text field prototype to be cloned for actual text fields
          $protoField = $('<input/>')
            .attr('readonly', 'readonly')
            .val(0)

          # create counter component
          $counter = $protoField.clone()
            .appendTo($displayPanel)
            .after(texts.moves) if control.counter

          # create timer component
          $timer = $protoField.clone()
            .appendTo($displayPanel)
            .after(texts.seconds) if control.timer

          # disable display if the puzzle is not shuffled yet
          $displayPanel.addClass('disabled') if not settings.shuffle

        # full gui (including wrapper and panel)
        $gui = $('<div/>')
          .attr('class', $srcImg.attr('class') or '')
          .addClass('puzzle')
          .css({
            width:     fullWidth + 2 * (computedStyles.wrapper.padding + computedStyles.wrapper.border)
            overflow:  'hidden'
          })
          .append($wrapper).append($controls)

        # replace source image with puzzle
        $srcImg.replaceWith($gui)

        # assign source image id to puzzle
        id = $srcImg.attr('id')
        $gui.attr('id', id) if id

        # hide numbers
        $pieces.children().hide() if not settings.numbers


        # attach events --------------------------------------------------------

        # prevent text selection
        $gui.mousedown(() -> return false)

        # button press on mousedown
        $buttons.mousedown(() -> $(this).addClass('down') if not $(this).is('.disabled'))
        $buttons.mouseout(()  -> $(this).removeClass('down'))
        $buttons.mouseup(()   -> $(this).removeClass('down'))

        # swap pieces on click
        $pieces.click(() ->
          # do nothing if locked
          return false if lock

          # do nothing if solved after being shuffled
          return false if solved

          lock = true # set lock

          $piece = $(this)

          # get current position from expando
          current = $piece.attr('current')

          # get current matrix positions for piece and hole
          source = getMatrixPosition(current)
          dest   = getMatrixPosition(currHole)

          # only swap pieces adjacent to the hole
          if Math.abs(source.row - dest.row) + Math.abs(source.col - dest.col) != 1
            lock = false
            return false

          # get offset for the new position
          offset = getOffset(dest.row, dest.col)

          # update piece expando and current hole position
          $piece.attr('current', currHole)
          currHole = current

          # increase moves counter only if the puzzle was shuffled
          moves++ if shuffled

          # update counter field
          $counter.val(moves) if $counter

          # start timer, if needed
          if moves == 1
            # initiate timer with update function
            timer = new Timer(333, ((ms) ->
              seconds = Math.floor(ms / 1000)
              $timer.val(seconds) if $timer
            )) if not timer
            timer.start()

          # animate!
          $piece.animate({ left: offset.left, top: offset.top }, animation.slidingSpeed, null, (() ->
            # only check if the puzzle was shuffled
            if shuffled
              # check if the puzzle is solved
              solved = checkSolution($pieces)
              if solved
                timer.stop() if timer
                shuffled = false
                $gui.addClass('solved')
                window.setTimeout(finishGame, 100)
              else
                lock = false
            else
              lock = false
          ))
        )

        # shuffle pieces on click
        $shuffleButton.click((() ->
          shuffle(animation.shuffleRounds, animation.shuffleSpeed)
        )) if control.shufflePieces

        # toggle numbers on click
        $numbersButton.click((() ->
          # do nothing if disabled
          return false if $numbersButton.is('.disabled')

          if $numbersButton.is('.toggle')
            $numbersButton.removeClass('toggle')
            $pieces.children().hide()
          else
            $numbersButton.addClass('toggle')
            $pieces.children().show()
        )) if control.toggleNumbers

        # toggle original on click
        $originalButton.click((() ->
          # do nothing if disabled
          return false if $originalButton.is('.disabled')

          # do nothing if locked
          return false if lock

          lock = true # set lock

          if $originalButton.is('.toggle')
            # re-enable other buttons
            $shuffleButton.removeClass('disabled') if control.shufflePieces
            $numbersButton.removeClass('disabled') if control.toggleNumbers

            $originalButton.removeClass('toggle')

            # fade out original
            $background.fadeTo(animation.fadeOriginalSpeed, style.backgroundOpacity, (() ->
              $(this).prependTo($wrapper)

              # resume timer
              timer.resume() if control.pauseTimer and timer

              lock = false
            ))
          else
            # disable other buttons
            $shuffleButton.addClass('disabled') if control.shufflePieces
            $numbersButton.addClass('disabled') if control.toggleNumbers

            $originalButton.addClass('toggle')

            # pause timer
            timer.pause() if control.pauseTimer and timer

            # fade in original
            $background.appendTo($wrapper).fadeTo(animation.fadeOriginalSpeed, 1.0, (() ->
              lock = false
            ))

          return false # prevent default action
        )) if control.toggleOriginal


        # work to do when the puzzle is solved
        finishGame = () ->
          if success.fadeOriginal
            # disable buttons
            $originalButton.addClass('disabled') if control.toggleOriginal
            $numbersButton.addClass('disabled')  if control.toggleNumbers

            # fade in original
            $background.appendTo($wrapper).fadeTo(animation.fadeOriginalSpeed, 1.0, (() ->
              lock = false       # reset lock
              solutionCallback() # call user callback
            ))
          else
            lock = false       # reset lock
            solutionCallback() # call user callback

        # call a user-defined callback when the puzzle is solved
        solutionCallback = () ->
          if $.isFunction(success.callback)
            setTimeout((() ->
              success.callback({ moves: moves, seconds: seconds })
            ), success.callbackTimeout)

      )) # img load

      # unfortunately, image load does not fire consistently across browsers, so
      # check img load periodically
      interval = setInterval((() ->
        if $srcImg[0].complete
          clearInterval(interval)
          $srcImg.trigger('load')
      ), 333)

    )).end() # return full collection to allow chaining

  # automagically apply puzzle to all images with class 'puzzle'
  $(document).ready(() ->
    $('img.puzzle').each(() ->
      # call the plugin
      $(this).puzzle()
    )
  )

  ##
  # A reusable timer component.
  #
  class Timer

    constructor: (interval, callback) ->
      @interval = interval
      @callback = callback

      @timeout        = undefined
      @startTime      = undefined
      @startPauseTime = undefined
      @totalPause     = 0

    run: ->
      @update(new Date().getTime())
      @timeout = setTimeout((() => @run()), @interval)

    update: (now) ->
      @callback(now - @totalPause - @startTime)

    # start the timer
    start: ->
      return false if @startTime?
      @startTime = new Date().getTime()
      @run()

    # stop the timer
    stop: ->
      return false if not @startTime?
      clearTimeout(@timeout)
      now = new Date().getTime()
      @totalPause += now - @startPauseTime if @startPauseTime?
      @update(now)
      @startTime      = undefined
      @startPauseTime = undefined
      @totalPause     = 0

    # pause the timer
    pause: ->
      return false if not @startTime? or @startPauseTime?
      clearTimeout(@timeout)
      @startPauseTime = new Date().getTime()

    # resume the timer
    resume: ->
      return false if not @startPauseTime?
      @totalPause += new Date().getTime() - @startPauseTime
      @startPauseTime = undefined
      @run()

)(jQuery)

