import { useState, useEffect } from 'react'
import React from 'react'
import './App.css'
import './CustomDrink.css'

function App() {
  const [gameState, setGameState] = useState('home') // 'home', 'selectDrinks', 'playing', or 'unlockPopup'
  const [currentDay, setCurrentDay] = useState(1)
  const [currentDrink, setCurrentDrink] = useState(1)
  const [currentQuestion, setCurrentQuestion] = useState(1)
  const [answer, setAnswer] = useState('')
  const [question, setQuestion] = useState({ num1: 0, num2: 0, answer: 0 })
  const [feedback, setFeedback] = useState('')
  const [shake, setShake] = useState(false)
  const [completedDays, setCompletedDays] = useState(() => {
    const saved = localStorage.getItem('multiplicationCafeCompletedDays')
    return saved ? JSON.parse(saved) : []
  })
  const [lastWrongAnswer, setLastWrongAnswer] = useState(null)
  const [selectedDrinks, setSelectedDrinks] = useState([])
  const [unlockedDrinks, setUnlockedDrinks] = useState(() => {
    const saved = localStorage.getItem('multiplicationCafeUnlockedDrinks')
    return saved ? JSON.parse(saved) : ['Coffee', 'Matcha Latte', 'Chocolate Milkshake']
  })
  const [newlyUnlockedDrink, setNewlyUnlockedDrink] = useState(null)
  const [customizingDrink, setCustomizingDrink] = useState(false)
  const [customDrink, setCustomDrink] = useState(() => {
    const saved = localStorage.getItem('multiplicationCafeCustomDrink')
    if (saved) {
      const parsed = JSON.parse(saved)
      // Handle old format with single color
      if (parsed.color && !parsed.colors) {
        return {
          ...parsed,
          colors: [parsed.color]
        }
      }
      // Ensure colors array exists
      if (!parsed.colors) {
        parsed.colors = ['#FFB6C1']
      }
      return parsed
    }
    return {
      name: 'My Custom Drink',
      colors: ['#FFB6C1'],
      toppings: []
    }
  })

  // Save to localStorage whenever completedDays changes
  useEffect(() => {
    localStorage.setItem('multiplicationCafeCompletedDays', JSON.stringify(completedDays))
  }, [completedDays])

  // Save to localStorage whenever unlockedDrinks changes
  useEffect(() => {
    localStorage.setItem('multiplicationCafeUnlockedDrinks', JSON.stringify(unlockedDrinks))
  }, [unlockedDrinks])

  // Save to localStorage whenever customDrink changes
  useEffect(() => {
    localStorage.setItem('multiplicationCafeCustomDrink', JSON.stringify(customDrink))
  }, [customDrink])

  const restartWeek = () => {
    if (window.confirm('Are you sure you want to restart the week? All progress will be lost.')) {
      localStorage.removeItem('multiplicationCafeCompletedDays')
      localStorage.removeItem('multiplicationCafeUnlockedDrinks')
      localStorage.removeItem('multiplicationCafeCustomDrink')
      setCompletedDays([])
      setUnlockedDrinks(['Coffee', 'Matcha Latte', 'Chocolate Milkshake'])
      setCustomDrink({
        name: 'My Custom Drink',
        colors: ['#FFB6C1'],
        toppings: []
      })
      setGameState('home')
    }
  }

  const rainbowColors = [
    '#FFB3BA', // Pastel Red/Pink
    '#FFDFBA', // Pastel Orange
    '#FFFFBA', // Pastel Yellow
    '#BAFFC9', // Pastel Light Green
    '#BAE1FF', // Pastel Cyan
    '#B8C5FF', // Pastel Blue
    '#E0BBE4', // Pastel Purple
    '#FFBAE8', // Pastel Magenta
    '#FFC8DD', // Pastel Light Pink
    '#D4BBFF'  // Pastel Lavender
  ]

  const drinks = [
    { name: 'Coffee', color: '#bd967a', unlockDay: 0 },
    { name: 'Matcha Latte', color: '#88C57F', unlockDay: 0 },
    { name: 'Chocolate Milkshake', color: '#5C4033', unlockDay: 0 },
    { name: 'Strawberry Milkshake', color: '#FFB6C1', unlockDay: 1, hasFruit: 'strawberry' },
    { name: 'Rainbow Drink', color: '#FFB3BA', hasRainbow: true, unlockDay: 2 },
    { name: 'Bluey Drink', color: '#BAE1FF', unlockDay: 3, hasFruit: 'bluey' },
    { name: 'Boba Tea', color: '#D2691E', hasBoba: true, unlockDay: 4 },
    { name: 'Labubu Dubai Chocolate Matcha', color: '#88C57F', hasLabubu: true, unlockDay: 5 },
    { name: 'Make Your Own Drink', color: 'transparent', unlockDay: 6, isCustom: true, customData: customDrink }
  ]

  const currentDrinkInfo = selectedDrinks.length > 0 ? selectedDrinks[currentDrink - 1] : drinks[0]
  const cupFillPercentage = (currentQuestion / 13) * 100
  
  // Helper to get custom drink color or gradient
  const getCustomDrinkBackground = () => {
    if (!customDrink.colors || customDrink.colors.length === 0) return '#FFB6C1'
    if (customDrink.colors.length === 1) return customDrink.colors[0]
    return `linear-gradient(to top, ${customDrink.colors.join(', ')})`
  }
  
  // For rainbow drink, create gradient with layers up to current question
  const getRainbowGradient = () => {
    if (!currentDrinkInfo.hasRainbow || currentQuestion === 0) {
      // If custom drink, use custom colors
      return currentDrinkInfo.isCustom ? getCustomDrinkBackground() : currentDrinkInfo.color
    }
    const colorsToShow = rainbowColors.slice(0, currentQuestion)
    return `linear-gradient(to top, ${colorsToShow.join(', ')})`
  }

  // Base URL for assets (works locally and on GitHub Pages)
  const baseUrl = import.meta.env.BASE_URL

  // Audio effects
  const bgMusicRef = React.useRef(null)
  const endingMusicRef = React.useRef(null)

  // Play background music when day starts
  useEffect(() => {
    if (gameState === 'selectDrinks' || gameState === 'playing') {
      if (!bgMusicRef.current) {
        bgMusicRef.current = new Audio(`${baseUrl}assets/bg.mp3`)
        bgMusicRef.current.loop = true
        bgMusicRef.current.volume = 0.3 // Quiet volume
      }
      bgMusicRef.current.play().catch(err => console.log('Audio play failed:', err))
    } else if (bgMusicRef.current) {
      bgMusicRef.current.pause()
    }

    return () => {
      if (bgMusicRef.current) {
        bgMusicRef.current.pause()
      }
    }
  }, [gameState])

  // Play ending music when week is complete
  useEffect(() => {
    if (gameState === 'weekComplete') {
      if (!endingMusicRef.current) {
        endingMusicRef.current = new Audio(`${baseUrl}assets/ending.mp3`)
        endingMusicRef.current.volume = 0.5
      }
      endingMusicRef.current.play().catch(err => console.log('Ending audio play failed:', err))
    }

    return () => {
      if (endingMusicRef.current) {
        endingMusicRef.current.pause()
        endingMusicRef.current.currentTime = 0
      }
    }
  }, [gameState])

  const playPourSound = () => {
    const pourAudio = new Audio(`${baseUrl}assets/pour.MP3`)
    pourAudio.volume = 0.5
    pourAudio.play().catch(err => console.log('Pour sound failed:', err))
  }

  const playToppingsSound = () => {
    const toppingsAudio = new Audio(`${baseUrl}assets/toppings.mp3`)
    toppingsAudio.volume = 0.5
    toppingsAudio.play().catch(err => console.log('Toppings sound failed:', err))
  }

  const playWinSound = () => {
    const winAudio = new Audio(`${baseUrl}assets/win.mp3`)
    winAudio.volume = 0.6
    winAudio.play().catch(err => console.log('Win sound failed:', err))
  }

  // Play win sound when unlock popup appears
  useEffect(() => {
    if (gameState === 'unlockPopup') {
      playWinSound()
    }
  }, [gameState])

  // Generate a new multiplication question based on current day
  const generateQuestion = () => {
    let num1, num2
    
    // Set multiplication practice based on current day
    switch(currentDay) {
      case 1:
        // Day 1: 3 times table, multipliers 1-6
        num1 = 3
        num2 = Math.floor(Math.random() * 6) + 1
        break
      case 2:
        // Day 2: 4 times table, multipliers 1-10
        num1 = 4
        num2 = Math.floor(Math.random() * 10) + 1
        break
      case 3:
        // Day 3: 4 times table, multipliers 1-10
        num1 = 4
        num2 = Math.floor(Math.random() * 10) + 1
        break
      case 4:
        // Day 4: 4 times table, multipliers 1-10
        num1 = 4
        num2 = Math.floor(Math.random() * 10) + 1
        break
      case 5:
        // Day 5: 3 and 4 times tables (4 always first)
        const tables = [3, 4]
        num1 = tables[Math.floor(Math.random() * 2)]
        num2 = Math.floor(Math.random() * 10) + 1
        if (Math.random() < 0.5 && num1 === 3) {
          // Swap to ensure 4 is first sometimes, but also practice 3
          [num1, num2] = [num2, num1]
        }
        break
      case 6:
      case 7:
        // Day 6 & 7: Tables 1, 2, 3, 4, 10, 11, 0 (4 always first)
        const tablesDay67 = [1, 2, 3, 4, 10, 11, 0]
        num1 = tablesDay67[Math.floor(Math.random() * tablesDay67.length)]
        num2 = Math.floor(Math.random() * 10) + 1
        // Prioritize 4 times table to be first
        if (Math.random() < 0.3) {
          num1 = 4
        }
        break
      default:
        num1 = 4
        num2 = Math.floor(Math.random() * 10) + 1
    }
    
    const answer = num1 * num2
    setQuestion({ num1, num2, answer })
  }

  useEffect(() => {
    if (gameState === 'playing') {
      generateQuestion()
      // Focus input after question changes
      setTimeout(() => {
        const input = document.querySelector('.answer-input')
        if (input) input.focus()
      }, 100)
    }
  }, [gameState, currentQuestion])

  const startDay = (day) => {
    setCurrentDay(day)
    setSelectedDrinks([])
    setGameState('selectDrinks')
  }

  const startGameWithDrinks = () => {
    setCurrentDrink(1)
    setCurrentQuestion(1)
    setAnswer('')
    setFeedback('')
    setLastWrongAnswer(null)
    setGameState('playing')
  }

  const toggleDrinkSelection = (drink) => {
    if (!unlockedDrinks.includes(drink.name)) return
    
    // If it's the custom drink and hasn't been customized yet, open customization menu
    if (drink.isCustom && customDrink.name === 'My Custom Drink') {
      setCustomizingDrink(true)
      return
    }
    
    // Normal selection logic for all drinks including customized custom drink
    if (selectedDrinks.some(d => d.name === drink.name || (d.isCustom && drink.isCustom))) {
      setSelectedDrinks(selectedDrinks.filter(d => !(d.isCustom && drink.isCustom) && d.name !== drink.name))
    } else if (selectedDrinks.length < 3) {
      setSelectedDrinks([...selectedDrinks, drink])
    }
  }

  const handleAnswerChange = (e) => {
    setAnswer(e.target.value)
    // Clear wrong answer tracking when user changes the answer
    if (lastWrongAnswer !== null && e.target.value !== lastWrongAnswer) {
      setLastWrongAnswer(null)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (answer === '') return

    if (parseInt(answer) === question.answer) {
      setFeedback('✓ Correct!')
      setAnswer('')
      setLastWrongAnswer(null)
      
      // Play pour sound
      playPourSound()
      
      // Check if we need to play toppings sound
      const nextQuestion = currentQuestion + 1
      if (currentDrinkInfo.hasFruit || currentDrinkInfo.hasLabubu) {
        // For labubu, play at questions 4, 9, 13
        if (currentDrinkInfo.hasLabubu && (nextQuestion === 4 || nextQuestion === 9 || nextQuestion === 13)) {
          setTimeout(() => playToppingsSound(), 300)
        }
        // For fruit, play on every question
        else if (currentDrinkInfo.hasFruit) {
          setTimeout(() => playToppingsSound(), 300)
        }
      }
      
      if (currentQuestion < 13) {
        setTimeout(() => {
          setCurrentQuestion(currentQuestion + 1)
          setFeedback('')
        }, 500)
      } else {
        setFeedback('🎉 Order ready to serve!')
      }
    } else {
      setFeedback('✗ Try again!')
      setLastWrongAnswer(answer)
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
  }

  const serveDrink = () => {
    if (currentQuestion === 13) {
      if (currentDrink < 3) {
        setCurrentDrink(currentDrink + 1)
        setCurrentQuestion(1)
        setAnswer('')
        setFeedback('')
        setLastWrongAnswer(null)
      } else {
        // Day completed
        // Check if day 7 is completed - always show week complete
        if (currentDay === 7) {
          setGameState('weekComplete')
          if (!completedDays.includes(currentDay)) {
            setCompletedDays([...completedDays, currentDay])
          }
          return
        }
        
        if (!completedDays.includes(currentDay)) {
          const newCompletedDays = [...completedDays, currentDay]
          setCompletedDays(newCompletedDays)
          
          // Check if we unlocked a new drink
          const drinkToUnlock = drinks.find(d => d.unlockDay === currentDay)
          if (drinkToUnlock && !unlockedDrinks.includes(drinkToUnlock.name)) {
            setNewlyUnlockedDrink(drinkToUnlock)
            setUnlockedDrinks([...unlockedDrinks, drinkToUnlock.name])
            setGameState('unlockPopup')
            return
          }
        }
        setGameState('dayComplete')
      }
    }
  }

  const goHome = () => {
    setGameState('home')
    setFeedback('')
  }

  const continueAfterUnlock = () => {
    setGameState('dayComplete')
  }

  const saveCustomDrink = () => {
    const updatedDrink = { ...customDrink }
    setCustomDrink(updatedDrink)
    
    // Create custom drink object with current settings
    const customDrinkToAdd = {
      name: updatedDrink.name,
      colors: updatedDrink.colors,
      isCustom: true,
      customData: updatedDrink,
      unlockDay: 6
    }
    
    // Add to selected drinks if not already there and not full
    const hasCustomInSelection = selectedDrinks.some(d => d.isCustom)
    if (!hasCustomInSelection && selectedDrinks.length < 3) {
      setSelectedDrinks([...selectedDrinks, customDrinkToAdd])
    } else if (hasCustomInSelection) {
      // Update existing custom drink in selection
      setSelectedDrinks(selectedDrinks.map(d => 
        d.isCustom ? customDrinkToAdd : d
      ))
    }
    
    setCustomizingDrink(false)
  }

  const toggleTopping = (topping) => {
    if (customDrink.toppings.includes(topping)) {
      setCustomDrink({
        ...customDrink,
        toppings: customDrink.toppings.filter(t => t !== topping)
      })
    } else {
      setCustomDrink({
        ...customDrink,
        toppings: [...customDrink.toppings, topping]
      })
    }
  }

  // Customization menu
  if (customizingDrink) {
    const colorOptions = ['#FFB6C1', '#88C57F', '#FFD966', '#D2691E', '#bd967a', '#5C4033', '#BAE1FF', '#E0BBE4', '#FFDFBA', '#BAFFC9']
    const toppingOptions = [
      { id: 'boba', label: 'Boba Balls', type: 'boba' },
      { id: 'labubu1', label: 'Labubu 1', type: 'labubu', image: `${baseUrl}assets/labubu_1.png` },
      { id: 'labubu2', label: 'Labubu 2', type: 'labubu', image: `${baseUrl}assets/labubu_2.png` },
      { id: 'labubu3', label: 'Labubu 3', type: 'labubu', image: `${baseUrl}assets/labubu_3.png` },
      { id: 'bluey', label: 'Bluey', type: 'fruit', image: `${baseUrl}assets/bluey.png` },
      { id: 'strawberry', label: 'Strawberry', type: 'fruit', image: `${baseUrl}assets/strawberry.png` },
      { id: 'sprinkles', label: 'Sprinkles', type: 'sprinkles', image: `${baseUrl}assets/sprinkles.png` }
    ]

    return (
      <div className="app home-screen">
        <div className="customization-overlay">
          <div className="customization-panel">
            <h1>🎨 Make Your Own Drink 🎨</h1>
            
            <div className="custom-section">
              <label>Drink Name:</label>
              <input 
                type="text"
                value={customDrink.name}
                onChange={(e) => setCustomDrink({ ...customDrink, name: e.target.value })}
                className="custom-name-input"
                placeholder="Enter drink name..."
              />
            </div>

            <div className="custom-section">
              <label>Choose Colors (select multiple for gradient):</label>
              <div className="color-options">
                {colorOptions.map(color => (
                  <div
                    key={color}
                    className={`color-option ${customDrink.colors.includes(color) ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      if (customDrink.colors.includes(color)) {
                        // Remove color if already selected (but keep at least one)
                        if (customDrink.colors.length > 1) {
                          setCustomDrink({ 
                            ...customDrink, 
                            colors: customDrink.colors.filter(c => c !== color) 
                          })
                        }
                      } else {
                        // Add color
                        setCustomDrink({ 
                          ...customDrink, 
                          colors: [...customDrink.colors, color] 
                        })
                      }
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="custom-section">
              <label>Choose Toppings:</label>
              <div className="topping-options">
                {toppingOptions.map(topping => (
                  <div
                    key={topping.id}
                    className={`topping-option ${customDrink.toppings.includes(topping.id) ? 'selected' : ''}`}
                    onClick={() => toggleTopping(topping.id)}
                  >
                    {topping.image ? (
                      <img src={topping.image} alt={topping.label} className="topping-icon" />
                    ) : (
                      <div className="topping-icon-boba">🧋</div>
                    )}
                    <span>{topping.label}</span>
                    {customDrink.toppings.includes(topping.id) && <span className="check-icon">✓</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="custom-preview">
              <h3>Preview:</h3>
              <div 
                className="custom-drink-preview" 
                style={{ 
                  background: customDrink.colors.length === 1 
                    ? customDrink.colors[0] 
                    : `linear-gradient(to top, ${customDrink.colors.join(', ')})`
                }}
              >
                {customDrink.toppings.includes('boba') && (
                  <div className="boba-preview-container">
                    {Array.from({ length: 4 }).map((_, idx) => (
                      <div 
                        key={idx} 
                        className="boba-ball-preview"
                        style={{
                          left: `${20 + (idx % 2) * 40}%`,
                          bottom: `${15 + Math.floor(idx / 2) * 30}%`,
                          animationDelay: `${idx * 0.3}s`
                        }}
                      />
                    ))}
                  </div>
                )}
                {(customDrink.toppings.includes('labubu1') || 
                  customDrink.toppings.includes('labubu2') || 
                  customDrink.toppings.includes('labubu3')) && (
                  <div className="labubu-preview-container">
                    {customDrink.toppings.includes('labubu1') && (
                      <img 
                        src={`${baseUrl}assets/labubu_1.png`} 
                        alt="labubu" 
                        className="labubu-preview"
                        style={{ left: '30%', bottom: '40%' }}
                      />
                    )}
                    {customDrink.toppings.includes('labubu2') && (
                      <img 
                        src={`${baseUrl}assets/labubu_2.png`} 
                        alt="labubu" 
                        className="labubu-preview"
                        style={{ left: '50%', bottom: '30%' }}
                      />
                    )}
                    {customDrink.toppings.includes('labubu3') && (
                      <img 
                        src={`${baseUrl}assets/labubu_3.png`} 
                        alt="labubu" 
                        className="labubu-preview"
                        style={{ left: '20%', bottom: '20%' }}
                      />
                    )}
                  </div>
                )}
                {(customDrink.toppings.includes('bluey') || customDrink.toppings.includes('strawberry')) && (
                  <div className="fruit-preview-container">
                    {Array.from({ length: 4 }).map((_, idx) => {
                      const fruits = []
                      if (customDrink.toppings.includes('bluey')) fruits.push('bluey')
                      if (customDrink.toppings.includes('strawberry')) fruits.push('strawberry')
                      const fruit = fruits[idx % fruits.length]
                      return (
                        <img 
                          key={idx}
                          src={`${baseUrl}assets/${fruit}.png`}
                          alt={fruit}
                          className="fruit-piece-preview"
                          style={{
                            left: `${20 + (idx % 2) * 40}%`,
                            bottom: `${15 + Math.floor(idx / 2) * 35}%`,
                            animationDelay: `${idx * 0.2}s`
                          }}
                        />
                      )
                    })}
                  </div>
                )}
                {customDrink.toppings.includes('sprinkles') && (
                  <img 
                    src={`${baseUrl}assets/sprinkles.png`} 
                    alt="Sprinkles" 
                    className="sprinkles-topper-preview"
                  />
                )}
              </div>
              <p className="custom-drink-name-preview">{customDrink.name}</p>
            </div>

            <div className="custom-buttons">
              <button className="cancel-button" onClick={() => setCustomizingDrink(false)}>
                Cancel
              </button>
              <button className="save-button" onClick={saveCustomDrink}>
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (gameState === 'unlockPopup') {
    return (
      <div className="app home-screen">
        <div className="unlock-popup-overlay">
          <div className="unlock-popup">
            <h1 className="unlock-title">New Drink Unlocked! 🎉</h1>
            <div className="unlocked-drink-display">
              <div 
                className="drink-preview-large" 
                style={{ 
                  background: newlyUnlockedDrink?.hasRainbow 
                    ? `linear-gradient(to top, ${rainbowColors.join(', ')})` 
                    : newlyUnlockedDrink?.color
                }}
              >
                {newlyUnlockedDrink?.hasBoba && (
                  <div className="boba-preview-container">
                    {Array.from({ length: 8 }).map((_, idx) => (
                      <div 
                        key={idx} 
                        className="boba-ball-preview"
                        style={{
                          left: `${15 + (idx % 3) * 25}%`,
                          bottom: `${10 + Math.floor(idx / 3) * 20}%`,
                          animationDelay: `${idx * 0.3}s`
                        }}
                      />
                    ))}
                  </div>
                )}
                {newlyUnlockedDrink?.hasLabubu && (
                  <>
                    <div className="chocolate-swirls-preview">
                      <div className="swirl swirl-1"></div>
                      <div className="swirl swirl-2"></div>
                    </div>
                    <div className="labubu-preview-container">
                      <img 
                        src={`${baseUrl}assets/labubu_1.png`} 
                        alt="labubu" 
                        className="labubu-preview"
                      />
                    </div>
                  </>
                )}
                {newlyUnlockedDrink?.hasFruit && (
                  <div className="fruit-preview-container">
                    {Array.from({ length: 6 }).map((_, idx) => (
                      <img 
                        key={idx}
                        src={`${baseUrl}assets/${newlyUnlockedDrink.hasFruit}.png`}
                        alt={newlyUnlockedDrink.hasFruit}
                        className="fruit-piece-preview"
                        style={{
                          left: `${15 + (idx % 3) * 25}%`,
                          bottom: `${10 + Math.floor(idx / 3) * 35}%`,
                          animationDelay: `${idx * 0.2}s`
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
              <h2 className="unlocked-drink-name">{newlyUnlockedDrink?.name}</h2>
              <p className="unlock-message">You can now serve this drink to customers!</p>
            </div>
            <button className="continue-button" onClick={continueAfterUnlock}>
              Continue →
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (gameState === 'selectDrinks') {
    return (
      <div className="app home-screen">
        <button className="back-button-fixed" onClick={goHome}>← Back to Café</button>
        <div className="drink-selection-screen">
          <h1>🍹 Day {currentDay} Menu 🍹</h1>
          <p className="selection-subtitle">Select 3 drinks to serve today ({selectedDrinks.length}/3)</p>
          
          <div className="drinks-menu">
            {drinks.map((drink, index) => {
              const isSelected = selectedDrinks.some(d => d.name === drink.name)
              const isLocked = !unlockedDrinks.includes(drink.name)
              return (
                <div
                  key={index}
                  className={`drink-card ${isSelected ? 'selected' : ''} ${isLocked ? 'locked' : ''}`}
                  onClick={() => toggleDrinkSelection(drink)}
                >
                  <div 
                    className="drink-preview" 
                    style={{ 
                      background: drink.hasRainbow 
                        ? `linear-gradient(to top, ${rainbowColors.join(', ')})` 
                        : drink.isCustom && customDrink.name === 'My Custom Drink'
                          ? 'transparent'
                          : drink.isCustom 
                            ? getCustomDrinkBackground() 
                            : drink.color
                    }}
                  >
                    {drink.hasBoba && (
                      <div className="boba-preview-container">
                        {Array.from({ length: 8 }).map((_, idx) => (
                          <div 
                            key={idx} 
                            className="boba-ball-preview"
                            style={{
                              left: `${15 + (idx % 3) * 25}%`,
                              bottom: `${10 + Math.floor(idx / 3) * 20}%`,
                              animationDelay: `${idx * 0.3}s`
                            }}
                          />
                        ))}
                      </div>
                    )}
                    {drink.hasLabubu && (
                      <>
                        <div className="chocolate-swirls-preview">
                          <div className="swirl swirl-1"></div>
                          <div className="swirl swirl-2"></div>
                        </div>
                        <div className="labubu-preview-container">
                          <img 
                            src={`${baseUrl}assets/labubu_1.png`} 
                            alt="labubu" 
                            className="labubu-preview"
                          />
                        </div>
                      </>
                    )}
                    {drink.hasFruit && (
                      <div className="fruit-preview-container">
                        {Array.from({ length: 6 }).map((_, idx) => (
                          <img 
                            key={idx}
                            src={`${baseUrl}assets/${drink.hasFruit}.png`}
                            alt={drink.hasFruit}
                            className="fruit-piece-preview"
                            style={{
                              left: `${15 + (idx % 3) * 25}%`,
                              bottom: `${10 + Math.floor(idx / 3) * 35}%`,
                              animationDelay: `${idx * 0.2}s`
                            }}
                          />
                        ))}
                      </div>
                    )}
                    {isLocked && <span className="lock-icon">🔒</span>}
                    {isSelected && !isLocked && <span className="check-mark">✓</span>}
                    {drink.isCustom && !isLocked && customDrink.name === 'My Custom Drink' && !isSelected && (
                      <span className="custom-question-mark">?</span>
                    )}
                    {drink.isCustom && !isLocked && customDrink.name !== 'My Custom Drink' && (
                      <>
                        {customDrink.toppings.includes('boba') && (
                          <div className="boba-preview-container">
                            {Array.from({ length: 8 }).map((_, idx) => (
                              <div 
                                key={idx} 
                                className="boba-ball-preview"
                                style={{
                                  left: `${15 + (idx % 3) * 25}%`,
                                  bottom: `${10 + Math.floor(idx / 3) * 20}%`,
                                  animationDelay: `${idx * 0.3}s`
                                }}
                              />
                            ))}
                          </div>
                        )}
                        {(customDrink.toppings.includes('labubu1') || 
                          customDrink.toppings.includes('labubu2') || 
                          customDrink.toppings.includes('labubu3')) && (
                          <div className="labubu-preview-container">
                            {customDrink.toppings.includes('labubu1') && (
                              <img 
                                src={`${baseUrl}assets/labubu_1.png`} 
                                alt="labubu" 
                                className="labubu-preview"
                              />
                            )}
                            {customDrink.toppings.includes('labubu2') && (
                              <img 
                                src={`${baseUrl}assets/labubu_2.png`} 
                                alt="labubu" 
                                className="labubu-preview"
                                style={{ left: '60%' }}
                              />
                            )}
                            {customDrink.toppings.includes('labubu3') && (
                              <img 
                                src={`${baseUrl}assets/labubu_3.png`} 
                                alt="labubu" 
                                className="labubu-preview"
                                style={{ left: '30%' }}
                              />
                            )}
                          </div>
                        )}
                        {(customDrink.toppings.includes('bluey') || customDrink.toppings.includes('strawberry')) && (
                          <div className="fruit-preview-container">
                            {Array.from({ length: 6 }).map((_, idx) => {
                              const fruits = []
                              if (customDrink.toppings.includes('bluey')) fruits.push('bluey')
                              if (customDrink.toppings.includes('strawberry')) fruits.push('strawberry')
                              const fruit = fruits[idx % fruits.length]
                              return (
                                <img 
                                  key={idx}
                                  src={`${baseUrl}assets/${fruit}.png`}
                                  alt={fruit}
                                  className="fruit-piece-preview"
                                  style={{
                                    left: `${15 + (idx % 3) * 25}%`,
                                    bottom: `${10 + Math.floor(idx / 3) * 35}%`,
                                    animationDelay: `${idx * 0.2}s`
                                  }}
                                />
                              )
                            })}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <div className="drink-name-label">
                    {drink.isCustom && drink.customData ? drink.customData.name : drink.name}
                  </div>
                  {isLocked && <div className="unlock-day-tooltip">Unlocks after Day {drink.unlockDay}</div>}
                  {drink.isCustom && !isLocked && customDrink.name !== 'My Custom Drink' && (
                    <button 
                      className="edit-drink-button" 
                      onClick={(e) => {
                        e.stopPropagation()
                        setCustomizingDrink(true)
                      }}
                    >
                      Edit
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          {selectedDrinks.length === 3 && (
            <button className="start-game-button" onClick={startGameWithDrinks}>
              Start Day {currentDay} →
            </button>
          )}
        </div>
      </div>
    )
  }

  if (gameState === 'home') {
    return (
      <div className="app home-screen">
        <button className="restart-week-button" onClick={restartWeek}>
          Restart Week
        </button>
        <div className="cafe-header">
          <h1>☕ Evelyn's Multiplication Café ☕</h1>
          <p className="tagline">Serve drinks, practice multiplication!</p>
        </div>
        <div className="days-container">
          <h2>Choose Your Day</h2>
          <div className="days-grid">
            {[1, 2, 3, 4, 5, 6, 7].map(day => {
              const isLocked = day > 1 && !completedDays.includes(day - 1)
              const isCompleted = completedDays.includes(day)
              return (
                <button
                  key={day}
                  className={`day-button ${isLocked ? 'locked' : ''} ${isCompleted ? 'completed' : ''}`}
                  onClick={() => !isLocked && startDay(day)}
                  disabled={isLocked}
                >
                  <div className="day-number">
                    {isLocked ? '🔒' : isCompleted ? '✓' : ''} Day {day}
                  </div>
                  <div className="day-subtitle">
                    {isLocked ? 'Complete Day ' + (day - 1) : '3 Drinks to Serve'}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  if (gameState === 'dayComplete') {
    return (
      <div className="app home-screen">
        <div className="complete-screen">
          <h1>🎉 Day {currentDay} Complete! 🎉</h1>
          <p>You've successfully served all 3 drinks!</p>
          <button className="home-button" onClick={goHome}>
            Return to Café
          </button>
        </div>
      </div>
    )
  }

  if (gameState === 'weekComplete') {
    return (
      <div className="app home-screen">
        <div className="week-complete-overlay">
          <div className="week-complete-container">
            <div className="week-complete-sign">
              <div className="sign-border">
                <h1 className="week-complete-title">Well Done Working A Week</h1>
                <h1 className="week-complete-title">At The Multiplication Café!</h1>
                <p className="week-complete-subtitle">See you soon ☕</p>
                
                <div className="screenshot-reminder">
                  <p>Take a screenshot of this page and send to Mifrah!</p>
                </div>
                <button className="home-button" onClick={goHome}>
                  Return to Café
                </button>
              </div>
            </div>
            
            <div className="evelyn-celebration">
              <div className="evelyn-wrapper">
                <div 
                  className="celebration-drink" 
                  style={{ 
                    background: customDrink.colors.length === 1 
                      ? customDrink.colors[0] 
                      : `linear-gradient(to top, ${customDrink.colors.join(', ')})`
                  }}
                >
                  {customDrink.toppings.includes('boba') && (
                    <div className="boba-preview-container">
                      {Array.from({ length: 4 }).map((_, idx) => (
                        <div 
                          key={idx} 
                          className="boba-ball-preview"
                          style={{
                            left: `${20 + (idx % 2) * 40}%`,
                            bottom: `${15 + Math.floor(idx / 2) * 30}%`,
                            animationDelay: `${idx * 0.3}s`
                          }}
                        />
                      ))}
                    </div>
                  )}
                  {(customDrink.toppings.includes('labubu1') || 
                    customDrink.toppings.includes('labubu2') || 
                    customDrink.toppings.includes('labubu3')) && (
                    <div className="labubu-preview-container">
                      {customDrink.toppings.includes('labubu1') && (
                        <img 
                          src={`${baseUrl}assets/labubu_1.png`} 
                          alt="labubu" 
                          className="labubu-preview"
                          style={{ left: '30%', bottom: '40%' }}
                        />
                      )}
                      {customDrink.toppings.includes('labubu2') && (
                        <img 
                          src={`${baseUrl}assets/labubu_2.png`} 
                          alt="labubu" 
                          className="labubu-preview"
                          style={{ left: '50%', bottom: '30%' }}
                        />
                      )}
                      {customDrink.toppings.includes('labubu3') && (
                        <img 
                          src={`${baseUrl}assets/labubu_3.png`} 
                          alt="labubu" 
                          className="labubu-preview"
                          style={{ left: '20%', bottom: '20%' }}
                        />
                      )}
                    </div>
                  )}
                  {(customDrink.toppings.includes('bluey') || customDrink.toppings.includes('strawberry')) && (
                    <div className="fruit-preview-container">
                      {Array.from({ length: 4 }).map((_, idx) => {
                        const fruits = []
                        if (customDrink.toppings.includes('bluey')) fruits.push('bluey')
                        if (customDrink.toppings.includes('strawberry')) fruits.push('strawberry')
                        const fruit = fruits[idx % fruits.length]
                        return (
                          <img 
                            key={idx}
                            src={`${baseUrl}assets/${fruit}.png`}
                            alt={fruit}
                            className="fruit-piece-preview"
                            style={{
                              left: `${20 + (idx % 2) * 40}%`,
                              bottom: `${15 + Math.floor(idx / 2) * 35}%`,
                              animationDelay: `${idx * 0.2}s`
                            }}
                          />
                        )
                      })}
                    </div>
                  )}
                  {customDrink.toppings.includes('sprinkles') && (
                    <img 
                      src={`${baseUrl}assets/sprinkles.png`} 
                      alt="Sprinkles" 
                      className="sprinkles-topper-preview"
                    />
                  )}
                </div>
                <img 
                  src={`${baseUrl}assets/Evelyn.png`} 
                  alt="Evelyn" 
                  className="evelyn-image"
                />
                <p className="custom-drink-label">This Week's Special: Evelyn's {customDrink.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app game-screen">
      <div className="game-header">
        <button className="back-button" onClick={goHome}>← Back to Café</button>
        <div className="progress-info">
          <span>Day {currentDay}</span>
          <span className="separator">•</span>
          <span>Drink {currentDrink}/3</span>
        </div>
      </div>

      <div className="game-content">
        <div className="coffee-machine">
          <div className="machine-top">
            <h2 className="drink-name">
              {currentDrinkInfo.isCustom && currentDrinkInfo.customData 
                ? currentDrinkInfo.customData.name 
                : currentDrinkInfo.name}
            </h2>
            <div className="order-label">Order #{currentDrink}</div>
          </div>
          
          <div className="cup-container">
            <div className="cup">
              <div 
                className="liquid" 
                style={{
                  height: `${cupFillPercentage}%`,
                  background: currentDrinkInfo.hasRainbow 
                    ? getRainbowGradient() 
                    : currentDrinkInfo.isCustom 
                      ? getCustomDrinkBackground() 
                      : currentDrinkInfo.color
                }}
              >
                {currentDrinkInfo.hasLabubu && (
                  <>
                    <div className="chocolate-swirls">
                      <div className="swirl swirl-1"></div>
                      <div className="swirl swirl-2"></div>
                      <div className="swirl swirl-3"></div>
                    </div>
                  </>
                )}
                <div className="liquid-wave"></div>
                {currentDrinkInfo.hasBoba && (
                  <div className="boba-container">
                    {Array.from({ length: currentQuestion }).map((_, idx) => (
                      <div 
                        key={idx} 
                        className="boba-ball"
                        style={{
                          left: `${15 + (idx % 4) * 20}%`,
                          bottom: `${10 + Math.floor(idx / 4) * 15}%`,
                          animationDelay: `${idx * 0.2}s`
                        }}
                      />
                    ))}
                  </div>
                )}
                {currentDrinkInfo.hasLabubu && (
                  <div className="labubu-container">
                    {currentQuestion >= 3 && (
                      <img 
                        src={`${baseUrl}assets/labubu_1.png`} 
                        alt="labubu" 
                        className="labubu-img labubu-1"
                      />
                    )}
                    {currentQuestion >= 7 && (
                      <img 
                        src={`${baseUrl}assets/labubu_2.png`} 
                        alt="labubu" 
                        className="labubu-img labubu-2"
                      />
                    )}
                    {currentQuestion >= 10 && (
                      <img 
                        src={`${baseUrl}assets/labubu_3.png`} 
                        alt="labubu" 
                        className="labubu-img labubu-3"
                      />
                    )}
                  </div>
                )}
                {currentDrinkInfo.hasFruit && (
                  <div className="fruit-container">
                    {Array.from({ length: currentQuestion }).map((_, idx) => (
                      <img 
                        key={idx}
                        src={`${baseUrl}assets/${currentDrinkInfo.hasFruit}.png`}
                        alt={currentDrinkInfo.hasFruit}
                        className="fruit-piece"
                        style={{
                          left: `${15 + (idx % 4) * 20}%`,
                          bottom: `${10 + Math.floor(idx / 4) * 15}%`,
                          animationDelay: `${idx * 0.2}s`
                        }}
                      />
                    ))}
                  </div>
                )}
                {currentDrinkInfo.isCustom && currentDrinkInfo.customData && (
                  <>
                    {currentDrinkInfo.customData.toppings.includes('boba') && (
                      <div className="boba-container">
                        {Array.from({ length: currentQuestion }).map((_, idx) => (
                          <div 
                            key={idx} 
                            className="boba-ball"
                            style={{
                              left: `${15 + (idx % 4) * 20}%`,
                              bottom: `${10 + Math.floor(idx / 4) * 15}%`,
                              animationDelay: `${idx * 0.2}s`
                            }}
                          />
                        ))}
                      </div>
                    )}
                    {(currentDrinkInfo.customData.toppings.includes('labubu1') || 
                      currentDrinkInfo.customData.toppings.includes('labubu2') || 
                      currentDrinkInfo.customData.toppings.includes('labubu3')) && (
                      <div className="labubu-container">
                        {currentDrinkInfo.customData.toppings.includes('labubu1') && currentQuestion >= 3 && (
                          <img 
                            src={`${baseUrl}assets/labubu_1.png`} 
                            alt="labubu" 
                            className="labubu-img labubu-1"
                          />
                        )}
                        {currentDrinkInfo.customData.toppings.includes('labubu2') && currentQuestion >= 7 && (
                          <img 
                            src={`${baseUrl}assets/labubu_2.png`} 
                            alt="labubu" 
                            className="labubu-img labubu-2"
                          />
                        )}
                        {currentDrinkInfo.customData.toppings.includes('labubu3') && currentQuestion >= 10 && (
                          <img 
                            src={`${baseUrl}assets/labubu_3.png`} 
                            alt="labubu" 
                            className="labubu-img labubu-3"
                          />
                        )}
                      </div>
                    )}
                    {(currentDrinkInfo.customData.toppings.includes('bluey') || 
                      currentDrinkInfo.customData.toppings.includes('strawberry')) && (
                      <div className="fruit-container">
                        {Array.from({ length: currentQuestion }).map((_, idx) => {
                          const fruits = []
                          if (currentDrinkInfo.customData.toppings.includes('bluey')) fruits.push('bluey')
                          if (currentDrinkInfo.customData.toppings.includes('strawberry')) fruits.push('strawberry')
                          const fruit = fruits[idx % fruits.length]
                          return (
                            <img 
                              key={idx}
                              src={`${baseUrl}assets/${fruit}.png`}
                              alt={fruit}
                              className="fruit-piece"
                              style={{
                                left: `${15 + (idx % 4) * 20}%`,
                                bottom: `${10 + Math.floor(idx / 4) * 15}%`,
                                animationDelay: `${idx * 0.2}s`
                              }}
                            />
                          )
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="cup-glass"></div>
              {currentDrinkInfo.hasLabubu && currentQuestion === 13 && (
                <img 
                  src={`${baseUrl}assets/_dubai_chocolate.png`} 
                  alt="Dubai Chocolate Topper" 
                  className="cup-topper"
                />
              )}
              {currentDrinkInfo.isCustom && currentDrinkInfo.customData?.toppings.includes('sprinkles') && currentQuestion === 13 && (
                <img 
                  src={`${baseUrl}assets/sprinkles.png`} 
                  alt="Sprinkles Topper" 
                  className="cup-topper"
                />
              )}
            </div>
            <div className="progress-text">{currentQuestion}/13 questions</div>
          </div>

          {currentQuestion === 13 && (
            <button className="serve-button" onClick={serveDrink}>
              {currentDrink === 3 ? 'Close Cafe' : 'Serve Drink →'}
            </button>
          )}
        </div>

        <div className="question-area">
          <div className="question-card">
            {currentQuestion === 13 ? (
              <div className="well-done-message">
                {currentDrink < 3 ? (
                  <>
                    <h2 className="incoming-title">Incoming Next Order</h2>
                    <div className="next-drink-preview">
                      <div 
                        className="next-drink-cup" 
                        style={{ 
                          background: selectedDrinks[currentDrink]?.hasRainbow 
                            ? `linear-gradient(to top, ${rainbowColors.join(', ')})` 
                            : selectedDrinks[currentDrink]?.color
                        }}
                      >
                        {selectedDrinks[currentDrink]?.hasBoba && (
                          <div className="boba-preview-container">
                            {Array.from({ length: 8 }).map((_, idx) => (
                              <div 
                                key={idx} 
                                className="boba-ball-preview"
                                style={{
                                  left: `${15 + (idx % 3) * 25}%`,
                                  bottom: `${10 + Math.floor(idx / 3) * 20}%`,
                                  animationDelay: `${idx * 0.3}s`
                                }}
                              />
                            ))}
                          </div>
                        )}
                        {selectedDrinks[currentDrink]?.hasLabubu && (
                          <>
                            <div className="chocolate-swirls-preview">
                              <div className="swirl swirl-1"></div>
                              <div className="swirl swirl-2"></div>
                            </div>
                            <div className="labubu-preview-container">
                              <img 
                                src={`${baseUrl}assets/labubu_1.png`} 
                                alt="labubu" 
                                className="labubu-preview"
                              />
                            </div>
                          </>
                        )}
                        {selectedDrinks[currentDrink]?.hasFruit && (
                          <div className="fruit-preview-container">
                            {Array.from({ length: 6 }).map((_, idx) => (
                              <img 
                                key={idx}
                                src={`${baseUrl}assets/${selectedDrinks[currentDrink].hasFruit}.png`}
                                alt={selectedDrinks[currentDrink].hasFruit}
                                className="fruit-piece-preview"
                                style={{
                                  left: `${15 + (idx % 3) * 25}%`,
                                  bottom: `${10 + Math.floor(idx / 3) * 35}%`,
                                  animationDelay: `${idx * 0.2}s`
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      <h3 className="next-drink-name">{selectedDrinks[currentDrink]?.name}</h3>
                    </div>
                    <p className="serve-instruction">Press "Serve Drink" to start the next order</p>
                  </>
                ) : (
                  <>
                    <div className="closing-sign">
                      <div className="sign-board">
                        <h2 className="closing-text">CLOSED</h2>
                        <p className="closing-subtitle">Thanks for today!</p>
                        <div className="closing-icon">☕️🌙</div>
                      </div>
                    </div>
                    <p className="serve-instruction">Press "Close Cafe" to finish the day</p>
                  </>
                )}
              </div>
            ) : (
              <>
                <h3>Multiplication Question</h3>
                <div className="question-text">
                  {question.num1} × {question.num2} = ?
                </div>
                
                <form onSubmit={handleSubmit} className={shake ? 'shake' : ''}>
                  <input
                    type="number"
                    value={answer}
                    onChange={handleAnswerChange}
                    placeholder="Type your answer..."
                    className="answer-input"
                    autoFocus
                    disabled={currentQuestion === 13}
                  />
                  <button 
                    type="submit" 
                    className="submit-button"
                    disabled={currentQuestion === 13 || answer === '' || (lastWrongAnswer !== null && answer === lastWrongAnswer)}
                  >
                    Check Answer
                  </button>
                </form>

                {feedback && (
                  <div className={`feedback ${feedback.includes('✓') ? 'correct' : feedback.includes('✗') ? 'incorrect' : 'ready'}`}>
                    {feedback}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
