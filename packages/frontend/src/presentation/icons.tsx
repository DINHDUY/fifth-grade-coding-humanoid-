import { Cpu, Eye, Mic, Radar, Music, Sparkles, RefreshCw, Bot, Code2, type LucideProps } from 'lucide-react';
import type React from 'react';
import type { IconName } from '../domain/types';

const icons: Record<IconName, React.ComponentType<LucideProps>> = { cpu: Cpu, eye: Eye, mic: Mic, radar: Radar, music: Music, sparkles: Sparkles, refresh: RefreshCw };
export const Icon = ({ name, ...props }: { name: IconName } & LucideProps) => { const Component = icons[name]; return <Component {...props} />; };
export { Bot, Code2 };
