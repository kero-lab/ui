import type { Meta, StoryObj } from '@storybook/react-vite';
import { faker } from '@faker-js/faker';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
/**
 * Demo story showing @faker-js/faker for deterministic test data.
 * Using `faker.seed(42)` ensures identical data across runs —
 * useful for visual regression testing and snapshot stability.
 */

interface User {
  name: string;
  email: string;
  role: 'admin' | 'user' | 'moderator';
  lastSeen: string;
}

function generateUsers(count: number): User[] {
  // Reset seed before each generation for deterministic output
  faker.seed(42);
  const roles: User['role'][] = ['admin', 'user', 'moderator'];
  return Array.from({ length: count }, () => ({
    name: faker.person.fullName(),
    email: faker.internet.email(),
    role: faker.helpers.arrayElement(roles),
    lastSeen: faker.date.recent({ days: 7 }).toLocaleDateString(),
  }));
}

function UserList({ users }: { users: User[] }) {
  return (
    <Card className="w-96">
      <CardHeader>
        <CardTitle className="text-sm">Team Members</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {users.map((user) => (
            <li key={user.email} className="flex items-center justify-between text-sm">
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <Badge
                variant={
                  user.role === 'admin'
                    ? 'destructive'
                    : user.role === 'moderator'
                      ? 'secondary'
                      : 'outline'
                }
              >
                {user.role}
              </Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

const meta = {
  title: 'Recipes/Faker Data',
  component: UserList,
  tags: ['autodocs', 'lifecycle:stable'],
} satisfies Meta<typeof UserList>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Seeded faker data — same output every run (seed=42) */
export const SeededUserList: Story = {
  args: { users: generateUsers(5) },
};

/** Single user */
export const SingleUser: Story = {
  args: { users: generateUsers(1) },
};

/** Large list */
export const ManyUsers: Story = {
  args: { users: generateUsers(12) },
};
