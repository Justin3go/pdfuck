import { XEmbedClient } from './xembed';
import { YoutubeVideo } from './youtube-video';
import { Accordion, Accordions } from 'fumadocs-ui/components/accordion';
import { Callout } from 'fumadocs-ui/components/callout';
import { Card, Cards } from 'fumadocs-ui/components/card';
import { CodeBlock, Pre } from 'fumadocs-ui/components/codeblock';
import { File, Files, Folder } from 'fumadocs-ui/components/files';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { TypeTable } from 'fumadocs-ui/components/type-table';
import {
  Cpu,
  Database,
  Globe,
  Home,
  Layout,
  LayoutTemplate,
  Palette,
  PanelsTopLeft,
  Search,
  Settings,
  Terminal,
  Zap,
  type LucideIcon,
} from 'lucide-react';

// Icon mapping for MDX components
const iconMap: Record<string, LucideIcon> = {
  // Full icon names
  CpuIcon: Cpu,
  DatabaseIcon: Database,
  GlobeIcon: Globe,
  HomeIcon: Home,
  LayoutIcon: Layout,
  LayoutTemplateIcon: LayoutTemplate,
  PaletteIcon: Palette,
  PanelsTopLeftIcon: PanelsTopLeft,
  SearchIcon: Search,
  SettingsIcon: Settings,
  TerminalIcon: Terminal,
  ZapIcon: Zap,
  // Short names (also used in MDX)
  Cpu,
  Database,
  Globe,
  Home,
  Layout,
  LayoutTemplate,
  Palette,
  PanelsTopLeft,
  Search,
  Settings,
  Terminal,
  Zap,
};

export function getMDXComponents() {
  return {
    // Layout components
    Accordion,
    Accordions,
    Callout,
    Card,
    Cards,
    Tab,
    Tabs,
    TypeTable,
    File,
    Files,
    Folder,

    // Code block
    pre: Pre,
    code: CodeBlock,

    // Icons
    ...iconMap,

    // Embeds
    XEmbedClient,
    YoutubeVideo,
  };
}
