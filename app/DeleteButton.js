'use client';
import { useRouter } from 'next/navigation';

export default function DeleteButton({ id }) {
  const router = useRouter();
  async function remove() {
    const password = prompt('Admin password to delete this pack:');
    if (!password) return;
    const res = await fetch('/api/packs', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, password }),
    });
    if (res.ok) router.refresh();
    else alert((await res.json()).error || 'Could not delete');
  }
  return <button className="btn ghost" onClick={remove}>Delete</button>;
}
