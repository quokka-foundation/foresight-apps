# Task #8: Mantine Mobile-First UI

**Status:** ⏳ Not Started
**Est:** 1h
**Priority:** P2
**Phase:** Wallet Features

## Acceptance Criteria

- [ ] Mantine v7 Provider wraps app in `layout.tsx`
- [ ] Mobile-first layout (max-width 400px for Frame context)
- [ ] Dashboard uses Mantine `Card`, `Stack`, `Badge` components
- [ ] Dark theme matches Farcaster aesthetic (#0a0b1e background)
- [ ] No Mantine flash of unstyled content (FOUC)

## Setup (`app/layout.tsx`)

```tsx
import { MantineProvider, createTheme } from '@mantine/core'
import '@mantine/core/styles.css'

const theme = createTheme({
  colorScheme: 'dark',
  primaryColor: 'blue',
  colors: {
    brand: ['#e8f4fd', '#bde0fa', '#91ccf7', '#65b8f4', '#38a4f0',
            '#1DA1F2', '#1890da', '#147fc2', '#106daa', '#0c5c92'],
  },
  fontFamily: 'Inter, system-ui, sans-serif',
})

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <MantineProvider theme={theme} defaultColorScheme="dark">
          {children}
        </MantineProvider>
      </body>
    </html>
  )
}
```

## Dashboard Layout (`app/dashboard/page.tsx`)

```tsx
import { Stack, Card, Text, Badge, Group, Title } from '@mantine/core'

export default function Dashboard() {
  return (
    <Stack p="md" maw={400} mx="auto">
      <Title order={2} c="blue">Yield Dashboard</Title>
      
      <Card withBorder bg="dark.8">
        <Group justify="space-between">
          <Text c="dimmed" size="sm">Deposited</Text>
          <Text fw={700}>$100.00</Text>
        </Group>
      </Card>
      
      <Card withBorder bg="dark.8">
        <Group justify="space-between">
          <Text c="dimmed" size="sm">Current Value</Text>
          <Badge color="green" size="xl">$112.00</Badge>
        </Group>
      </Card>
      
      <Card withBorder bg="dark.8">
        <Group justify="space-between">
          <Text c="dimmed" size="sm">APY</Text>
          <Badge color="blue" size="xl">12%</Badge>
        </Group>
      </Card>
    </Stack>
  )
}
```

## Frame-Optimized Breakpoints

```css
/* Frames render at ~400px wide in Warpcast */
.frame-container {
  max-width: 400px;
  margin: 0 auto;
}
```

**Next:** Task #9 — Telegram Bot QR Proxy
