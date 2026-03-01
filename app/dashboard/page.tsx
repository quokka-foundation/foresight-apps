// app/dashboard/page.tsx
// Yield metrics dashboard — Mantine v7, mobile-first (max 400px), dark theme

import { Stack, Card, Text, Badge, Group, Title, Button, Divider } from '@mantine/core'
import { YieldImage } from '@/components/YieldImage'
import { DEMO_PROJECTION } from '@/lib/constants'

export const metadata = {
  title: 'Yield Dashboard | Foresight',
  description: 'Track your $100 → $112 yield in 30 days at 12% APY on Base.',
}

export default function DashboardPage() {
  const { deposited, after30Days, days, apy } = DEMO_PROJECTION
  const profit = after30Days - deposited

  return (
    <main className="min-h-screen bg-[#0a0b1e] py-8">
      <Stack p="md" maw={400} mx="auto" gap="md">
        {/* Header */}
        <Group justify="space-between" align="center">
          <Title order={2} c="blue" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            Yield Dashboard
          </Title>
          <Badge color="green" variant="light" size="lg">
            Live
          </Badge>
        </Group>

        {/* Yield chart image */}
        <YieldImage />

        <Divider />

        {/* Stats grid */}
        <Card withBorder bg="dark.8" radius="md" p="md">
          <Group justify="space-between">
            <Text c="dimmed" size="sm">Deposited</Text>
            <Text fw={700} size="lg">${deposited.toFixed(2)}</Text>
          </Group>
        </Card>

        <Card withBorder bg="dark.8" radius="md" p="md">
          <Group justify="space-between">
            <Text c="dimmed" size="sm">Value after {days} days</Text>
            <Badge color="green" size="xl" variant="filled">
              ${after30Days.toFixed(2)}
            </Badge>
          </Group>
        </Card>

        <Card withBorder bg="dark.8" radius="md" p="md">
          <Group justify="space-between">
            <Text c="dimmed" size="sm">Profit</Text>
            <Text fw={700} c="green" size="lg">+${profit.toFixed(2)}</Text>
          </Group>
        </Card>

        <Card withBorder bg="dark.8" radius="md" p="md">
          <Group justify="space-between">
            <Text c="dimmed" size="sm">APY</Text>
            <Badge color="blue" size="xl" variant="filled">
              {apy}%
            </Badge>
          </Group>
        </Card>

        <Card withBorder bg="dark.8" radius="md" p="md">
          <Group justify="space-between">
            <Text c="dimmed" size="sm">Days Active</Text>
            <Text fw={700} size="lg">{days}</Text>
          </Group>
        </Card>

        <Divider />

        {/* CTA */}
        <Button
          component="a"
          href="/frame/usdc-vault"
          color="blue"
          size="lg"
          fullWidth
          radius="md"
        >
          Deposit $100 via Farcaster Frame
        </Button>

        <Text size="xs" c="dimmed" ta="center">
          Powered by Foresight on Base L2
        </Text>
      </Stack>
    </main>
  )
}
