import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Languages } from 'lucide-react';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const handleLanguageChange = (value: string) => {
    i18n.changeLanguage(value);
  };

  return (
    <div className="flex items-center gap-2">
      <Languages className="h-4 w-4 text-muted-foreground" />
      <Select value={i18n.resolvedLanguage || i18n.language} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-[120px] h-8 text-xs border-dashed">
          <SelectValue placeholder="Language" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en" className="text-xs">English</SelectItem>
          <SelectItem value="hi" className="text-xs">हिंदी (Hindi)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
