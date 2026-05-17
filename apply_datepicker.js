const fs = require('fs');

const pagePath = '/Users/khoait/Documents/SourceCompany/6v6-vietnam-official/app/(main)/giai-dau/[id]/page.tsx';
let code = fs.readFileSync(pagePath, 'utf8');

// 1. Change Calendar to CalendarIcon in lucide-react import
code = code.replace(
    'Loader2, Trophy, Users, Calendar, MapPin, Shield, CheckCircle2,',
    'Loader2, Trophy, Users, Calendar as CalendarIcon, MapPin, Shield, CheckCircle2,'
);

// 2. Add shadcn and date-fns imports
const newImports = `import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { vi } from "date-fns/locale";`;
code = code.replace('import { Badge } from "@/components/ui/badge";', newImports);

// 3. Fix the <Calendar className="..."/> uses to <CalendarIcon className="..."/>
// Wait, I should replace all occurrences of <Calendar className="..." /> with <CalendarIcon className="..." />
code = code.replace(/<Calendar /g, '<CalendarIcon ');

// 4. Replace the date input block
const oldDateInput = `<input 
                                        type="date" 
                                        value={regForm.dateOfBirth}
                                        onChange={(e) => setRegForm({...regForm, dateOfBirth: e.target.value})}
                                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-gray-700"
                                    />`;

const newDateInput = `<Popover>
                                        <PopoverTrigger asChild>
                                            <button
                                                type="button"
                                                className={\`w-full flex items-center justify-between border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 \${!regForm.dateOfBirth ? "text-gray-400" : "text-gray-700"}\`}
                                            >
                                                {regForm.dateOfBirth ? format(new Date(regForm.dateOfBirth), "PPP", { locale: vi }) : "Chọn ngày sinh"}
                                                <CalendarIcon className="w-4 h-4 text-gray-400" />
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 z-[110]" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={regForm.dateOfBirth ? new Date(regForm.dateOfBirth) : undefined}
                                                onSelect={(date) => {
                                                    if (date) {
                                                        // avoid timezone offset issues by formatting to YYYY-MM-DD
                                                        const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
                                                        setRegForm({...regForm, dateOfBirth: offsetDate.toISOString().split('T')[0]});
                                                    } else {
                                                        setRegForm({...regForm, dateOfBirth: ''});
                                                    }
                                                }}
                                                initialFocus
                                                locale={vi}
                                            />
                                        </PopoverContent>
                                    </Popover>`;

code = code.replace(oldDateInput, newDateInput);

fs.writeFileSync(pagePath, code, 'utf8');
console.log("Applied DatePicker changes.");
