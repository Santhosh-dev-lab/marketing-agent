import { redirect } from 'next/navigation';

export default function DocumentationRoot() {
  redirect('/documentation/overview');
}
