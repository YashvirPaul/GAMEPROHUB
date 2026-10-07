import { GameInfo } from '../types/game';

export const GAMES_LIST: GameInfo[] = [
  {
    id: 'speed-math',
    title: 'Speed Mental Math',
    category: 'Math & Logic',
    description: 'Boost numerical fluency and fast calculation reflexes. Calculate sums, differences, products, and quotients before the clock ticks down.',
    tagline: 'Train your brain to compute lightning-fast mental arithmetic',
    skillsTrained: ['Mental Arithmetic', 'Calculation Speed', 'Number Sense'],
    instructions: [
      'Look at the math question displayed on screen.',
      'Select the correct answer from the 4 options or enter your solution.',
      'Answer quickly to maintain your streak and bonus multiplier.',
      'Toughness dynamically scales based on your chosen age group.'
    ],
    difficultyInfo: {
      kid: 'Single-digit addition & subtraction (e.g., 6 + 7, 15 - 8) with generous 15-second timer.',
      teenager: 'Two-digit arithmetic, multiplication tables & division (e.g., 24 × 6, 84 ÷ 7) with 10-second timer.',
      adult: 'Multi-step mental arithmetic, squares & combined operations (e.g., 14 × 15 - 35) with 7-second timer.'
    },
    tags: ['Arithmetic', 'Brain Power', 'Mental Math'],
    popular: true,
    accentColor: 'emerald',
    rating: 4.9,
    usersTrained: '142k'
  },
  {
    id: 'equation-balancer',
    title: 'Algebra Equation Balancer',
    category: 'Equations',
    description: 'Solve for the missing variable X and balance equations. Strengthen problem-solving intuition and algebraic agility.',
    tagline: 'Isolate variables, balance both sides, and solve for X',
    skillsTrained: ['Algebraic Thinking', 'Problem Solving', 'Variable Isolation'],
    instructions: [
      'Read the algebraic equation (e.g., 2x + 6 = 20).',
      'Calculate the exact value of the variable X that makes both sides equal.',
      'Tap the correct value to proceed to the next equation.',
      'Streak bonuses reward zero-error problem-solving.'
    ],
    difficultyInfo: {
      kid: 'Simple box equations (e.g., [ ? ] + 8 = 15, x - 4 = 10) with visual aids.',
      teenager: 'Linear equations with coefficients (e.g., 3x + 7 = 31, 5x - 12 = 28).',
      adult: 'Multi-step algebraic equations with brackets & fractions (e.g., 2(3x - 4) = 40, x/4 + 9 = 22).'
    },
    tags: ['Algebra', 'Equations', 'Math IQ'],
    popular: true,
    accentColor: 'cyan',
    rating: 4.9,
    usersTrained: '98k'
  },
  {
    id: 'memory-matrix',
    title: 'Working Memory Matrix',
    category: 'Memory & Recall',
    description: 'Expand your active working memory capacity. Memorize flashing spatial grid sequences and replicate them accurately.',
    tagline: 'Neuro-cognitive training to expand your working memory span',
    skillsTrained: ['Working Memory', 'Spatial Recall', 'Short-Term Retention'],
    instructions: [
      'Observe the grid cells flashing in sequence.',
      'Hold the sequence in your memory.',
      'Click or tap the cells in the exact order after the countdown.',
      'Each level increases pattern length and complexity.'
    ],
    difficultyInfo: {
      kid: '3x3 grid with short 3-to-4 step sequences and gentle reveal pacing.',
      teenager: '4x4 grid with 5-to-7 step sequences and faster reveal speed.',
      adult: '5x5 grid with 8+ step sequences, reverse recalls, and distraction flashes.'
    },
    tags: ['Neuroscience', 'Working Memory', 'Cognitive Recall'],
    popular: true,
    accentColor: 'purple',
    rating: 4.8,
    usersTrained: '120k'
  },
  {
    id: 'word-power',
    title: 'Vocabulary & Word Power',
    category: 'Vocabulary',
    description: 'Master powerful words, precise definitions, synonyms, and verbal reasoning to communicate with clarity and confidence.',
    tagline: 'Supercharge your verbal intelligence and vocabulary breadth',
    skillsTrained: ['Verbal Intelligence', 'Synonyms & Antonyms', 'Reading Comprehension'],
    instructions: [
      'Read the target word and contextual usage sentence.',
      'Identify the exact synonym or definition among the 4 choices.',
      'Learn rich etymology and sentence examples after each answer.',
      'Build vocabulary from foundational spelling to advanced academic lexicon.'
    ],
    difficultyInfo: {
      kid: 'Essential everyday vocabulary, spelling, and basic synonyms (e.g., Courageous, Enormous).',
      teenager: 'High-school & SAT-level words (e.g., Meticulous, Resilient, Pragmatic, Ambiguous).',
      adult: 'Executive & GRE-level words (e.g., Ephemeral, Obfuscate, Equanimity, Paradigm).'
    },
    tags: ['Language', 'English', 'Communication'],
    popular: true,
    accentColor: 'rose',
    rating: 4.9,
    usersTrained: '86k'
  },
  {
    id: 'focus-typist',
    title: 'Productivity Speed Typist',
    category: 'Focus & Speed',
    description: 'Type inspiring dream-pursuit quotes and productivity wisdom with high words-per-minute (WPM) accuracy.',
    tagline: 'Train your typing speed while absorbing timeless wisdom',
    skillsTrained: ['Typing Speed (WPM)', 'Motor Accuracy', 'Focus Stamina'],
    instructions: [
      'Type the displayed words as quickly and accurately as possible.',
      'Green indicates correct characters; red indicates typos.',
      'Complete the quote to measure your official WPM and accuracy rate.',
      'Absorb motivating wisdom about discipline, goals, and focus.'
    ],
    difficultyInfo: {
      kid: 'Simple motivational words and short goal-oriented sentences (30-40 words total).',
      teenager: 'Inspiring paragraphs on discipline, dreams, and habit formation with punctuation.',
      adult: 'Dense philosophical quotes, professional syntax, and complex technical passages.'
    },
    tags: ['Typing Speed', 'WPM', 'Inspiration'],
    popular: true,
    accentColor: 'teal',
    rating: 4.8,
    usersTrained: '115k'
  },
  {
    id: 'number-grid-focus',
    title: 'Focus Number Matrix (Schulte)',
    category: 'Focus & Speed',
    description: 'Eliminate brain fog and train laser focus using the clinical Schulte table method. Find numbers in sequential order under time pressure.',
    tagline: 'Clinical visual search training to sharpen deep attention',
    skillsTrained: ['Selective Attention', 'Peripheral Vision', 'Visual Search'],
    instructions: [
      'Scan the scrambled matrix of numbers.',
      'Tap numbers in ascending order starting from 1 to the maximum.',
      'Maintain steady breathing and keep your eyes moving smoothly.',
      'Benchmark your visual processing speed in seconds.'
    ],
    difficultyInfo: {
      kid: '3x3 grid (numbers 1 to 9) with large colored targets.',
      teenager: '4x4 grid (numbers 1 to 16) with neutral high-contrast tiles.',
      adult: '5x5 grid (numbers 1 to 25) with tight timer and reverse ordering challenges.'
    },
    tags: ['Attention Span', 'Schulte Grid', 'Focus'],
    popular: false,
    accentColor: 'amber',
    rating: 4.7,
    usersTrained: '78k'
  },
  {
    id: 'fraction-percent',
    title: 'Fractions & Percentages Pro',
    category: 'Math & Logic',
    description: 'Never stumble on real-world calculations again. Master instant mental percentage discounts, fraction conversions, and decimal math.',
    tagline: 'Master real-world discounts, percentages, and fraction math',
    skillsTrained: ['Real-World Math', 'Percentage Fluency', 'Decimal Conversions'],
    instructions: [
      'Review the practical real-world scenario (discounts, tip, ratios, fractions).',
      'Calculate the resulting amount or percentage mentally.',
      'Pick the correct answer before the clock expires.',
      'Build life-long financial and estimation intuition.'
    ],
    difficultyInfo: {
      kid: 'Visual fractions (half, third, quarter) and basic 50% / 25% calculations.',
      teenager: 'Standard discount rates (e.g., 20% off $80, 15% tip, converting 3/8 to decimal).',
      adult: 'Compounding math, complex percentages (e.g., 18% of 250, fraction additions 5/7 + 2/3).'
    },
    tags: ['Real World', 'Percentages', 'Practical Math'],
    popular: false,
    accentColor: 'emerald',
    rating: 4.8,
    usersTrained: '92k'
  },
  {
    id: 'logic-sequences',
    title: 'Pattern & Logic Sequences',
    category: 'Math & Logic',
    description: 'Identify the underlying hidden mathematical pattern governing sequence series and predict the missing number.',
    tagline: 'Decode numerical patterns and geometric logic sequences',
    skillsTrained: ['Inductive Reasoning', 'Pattern Recognition', 'Mathematical Logic'],
    instructions: [
      'Examine the sequence of numbers (e.g., 2, 6, 18, 54, ?).',
      'Determine the rule governing the progression (multiplication, differences, squares).',
      'Select the number that logically belongs in the question mark position.',
      'Progress through increasingly sophisticated number series.'
    ],
    difficultyInfo: {
      kid: 'Simple arithmetic progressions (e.g., +3, +5, skip counting by 2s and 10s).',
      teenager: 'Geometric sequences, alternating rules, and difference-of-differences series.',
      adult: 'Fibonacci progressions, prime intervals, exponent series, and polynomial sequences.'
    },
    tags: ['IQ Logic', 'Patterns', 'Deductive Logic'],
    popular: true,
    accentColor: 'indigo',
    rating: 4.9,
    usersTrained: '104k'
  },
  {
    id: 'knowledge-quiz',
    title: 'Science & World Knowledge',
    category: 'Memory & Recall',
    description: 'Deepen your foundational understanding of the physical world, physics, geography, biology, and historical milestones.',
    tagline: 'Curated knowledge questions to expand your intellectual horizons',
    skillsTrained: ['General Knowledge', 'Scientific Method', 'World History'],
    instructions: [
      'Read 10 high-value knowledge questions per session.',
      'Pick the scientifically or historically accurate answer.',
      'Learn rich factual explanations after every question.',
      'Track your intellectual knowledge score across sessions.'
    ],
    difficultyInfo: {
      kid: 'Living world, solar system planets, animals, and earth fundamentals.',
      teenager: 'Physics laws, chemical elements, world geography, and invention history.',
      adult: 'Economics, constitutional history, astronomy, and deep scientific principles.'
    },
    tags: ['Science', 'General Knowledge', 'World History'],
    popular: false,
    accentColor: 'sky',
    rating: 4.8,
    usersTrained: '88k'
  },
  {
    id: 'task-prioritizer',
    title: 'Focus Priority Matrix',
    category: 'Focus & Speed',
    description: 'Overcome chronic procrastination and brain scatter. Practice the Eisenhower Matrix by sorting tasks into Urgent, Important, and Distraction categories.',
    tagline: 'Stop scrolling, defeat distraction, and prioritize your dreams',
    skillsTrained: ['Decision Making', 'Time Management', 'Priority Sorting'],
    instructions: [
      'A task or daily impulse appears on screen (e.g., "Scroll Social Media" vs "Finish Assignment").',
      'Categorize it swiftly: High Priority / Must Do vs Low Value / Distraction.',
      'Learn to ruthlessly identify time-wasters and protect your focus.',
      'Train mental discipline to prioritize your genuine life goals.'
    ],
    difficultyInfo: {
      kid: 'Clear choices between schoolwork/chores vs video games/distractions.',
      teenager: 'Balancing exam study, sleep, exercise, social media, and side projects.',
      adult: 'Deep work vs shallow work, email overload, strategic goals vs fire-fighting.'
    },
    tags: ['Productivity', 'Anti-Procrastination', 'Focus Habits'],
    popular: true,
    accentColor: 'rose',
    rating: 4.9,
    usersTrained: '135k'
  },
  {
    id: 'financial-iq',
    title: 'Financial IQ & Wealth Math',
    category: 'Practical Life',
    description: 'Master practical money calculations, savings accumulation, discount math, investment doubling rules, and compounding logic.',
    tagline: 'Build life-long financial literacy and numbers confidence',
    skillsTrained: ['Financial Math', 'Compound Interest', 'Discounts & Profit'],
    instructions: [
      'Analyze the real-world financial situation.',
      'Compute the target price, interest, savings, or profit mentally.',
      'Select the exact numerical solution before the timer runs out.',
      'Learn key wealth principles after each problem.'
    ],
    difficultyInfo: {
      kid: 'Piggy bank daily savings, counting bills & coins change at the grocery counter.',
      teenager: 'Seasonal percent discounts (20% off), calculating profit on sales & budgeting.',
      adult: 'Rule of 72 doubling time, annual bond yields & 50/30/20 wealth allocation rules.'
    },
    tags: ['Financial Literacy', 'Money Math', 'Practical Skills'],
    popular: true,
    accentColor: 'emerald',
    rating: 4.9,
    usersTrained: '94k'
  },
  {
    id: 'speed-reading',
    title: 'Speed Reading & Insight Recall',
    category: 'Practical Life',
    description: 'Double your reading speed and retain key insights. Read dense passages on psychology and dreams, measure your WPM, and test instant comprehension.',
    tagline: 'High-speed comprehension and instant insight retention',
    skillsTrained: ['Reading Speed (WPM)', 'Comprehension', 'Information Retention'],
    instructions: [
      'Read the passage attentively at your maximum focused speed.',
      'Tap "Finished Reading" as soon as you comprehend the passage.',
      'Answer the immediate comprehension question based strictly on the text.',
      'Benchmark your effective Words Per Minute (WPM) score.'
    ],
    difficultyInfo: {
      kid: 'Inspiring short fables about perseverance, bees, and nature (100 WPM benchmark).',
      teenager: 'Passages on neuroscience of focus, myelin, and single-tasking (180 WPM benchmark).',
      adult: 'First-principles thinking, asymmetry of high-leverage craft & deep work (250+ WPM).'
    },
    tags: ['Reading Speed', 'Comprehension', 'Deep Knowledge'],
    popular: false,
    accentColor: 'teal',
    rating: 4.8,
    usersTrained: '82k'
  }
];
