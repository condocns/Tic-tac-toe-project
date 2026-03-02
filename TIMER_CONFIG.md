# Game Configuration

## Environment Variables

You can configure both timer and bot thinking time using environment variables:

### Setup

1. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

2. Add your configuration:

```env
# Game Timer Configuration (seconds)
NEXT_PUBLIC_TURN_TIMER_EASY=30
NEXT_PUBLIC_TURN_TIMER_MEDIUM=20
NEXT_PUBLIC_TURN_TIMER_HARD=15

# Bot Thinking Time Configuration (seconds)
NEXT_PUBLIC_BOT_THINKING_EASY=2
NEXT_PUBLIC_BOT_THINKING_MEDIUM=3
NEXT_PUBLIC_BOT_THINKING_HARD=4
```

### Configuration Options

#### Timer Settings
| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_TURN_TIMER_EASY` | 30 | Time limit for easy mode (seconds) |
| `NEXT_PUBLIC_TURN_TIMER_MEDIUM` | 20 | Time limit for medium mode (seconds) |
| `NEXT_PUBLIC_TURN_TIMER_HARD` | 15 | Time limit for hard mode (seconds) |

#### Bot Thinking Time
| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_BOT_THINKING_EASY` | 2 | Bot thinking time for easy mode (seconds) |
| `NEXT_PUBLIC_BOT_THINKING_MEDIUM` | 3 | Bot thinking time for medium mode (seconds) |
| `NEXT_PUBLIC_BOT_THINKING_HARD` | 4 | Bot thinking time for hard mode (seconds) |

### Examples

#### Slow Bot (Beginner Friendly)
```env
NEXT_PUBLIC_BOT_THINKING_EASY=5
NEXT_PUBLIC_BOT_THINKING_MEDIUM=4
NEXT_PUBLIC_BOT_THINKING_HARD=3
```

#### Fast Bot (Challenge Mode)
```env
NEXT_PUBLIC_BOT_THINKING_EASY=1
NEXT_PUBLIC_BOT_THINKING_MEDIUM=0.8
NEXT_PUBLIC_BOT_THINKING_HARD=0.6
```

#### Tournament Mode
```env
NEXT_PUBLIC_BOT_THINKING_EASY=3
NEXT_PUBLIC_BOT_THINKING_MEDIUM=2
NEXT_PUBLIC_BOT_THINKING_HARD=1.5
```

#### Very Slow Bot (Relaxed Play)
```env
NEXT_PUBLIC_BOT_THINKING_EASY=8
NEXT_PUBLIC_BOT_THINKING_MEDIUM=6
NEXT_PUBLIC_BOT_THINKING_HARD=5
```

### How it Works

- Bot thinking times are read from environment variables at build time
- If no environment variable is set, default values are used
- The bot shows "🤔 Analyzing board..." during thinking time
- Longer thinking times make the bot feel more thoughtful and less robotic

### Notes

- Values must be positive numbers (seconds for both timer and bot thinking)
- Minimum recommended bot thinking: 0.5 seconds
- Maximum recommended bot thinking: 10 seconds
- Decimal values are supported (e.g., 1.5, 2.5, 0.8)
- Changes require restart of the application
