
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns-jalali';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Debt, DebtType, Category, Bank } from '../types';
import { queryCustomTable, numberToPersianWords } from '@/utils/supabaseUtils';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AddDebtFormProps {
  onAddDebt: (debt: Omit<Debt, "id" | "createdAt">) => Promise<Debt>;
}

// Get app settings from localStorage
const getAppSettings = () => {
  const defaultSettings = {
    requiredFields: {
      name: true,
      category: false,
      bank: false,
      description: true,
    },
    enabledFeatures: {
      categories: true,
      banks: true,
    }
  };
  
  try {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      return {
        requiredFields: settings.requiredFields || defaultSettings.requiredFields,
        enabledFeatures: settings.enabledFeatures || defaultSettings.enabledFeatures
      };
    }
    return defaultSettings;
  } catch {
    return defaultSettings;
  }
};

const AddDebtForm: React.FC<AddDebtFormProps> = ({ onAddDebt }) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [amountInWords, setAmountInWords] = useState<string>('');
  const [formattedAmount, setFormattedAmount] = useState<string>('');
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const settings = getAppSettings();
  
  // Fetch categories and banks
  useEffect(() => {
    const fetchCategoriesAndBanks = async () => {
      if (settings.enabledFeatures.categories) {
        // Use our custom query utility for debt_categories
        const { data: categoriesData } = await queryCustomTable('debt_categories')
          .select('*')
          .order('name');
          
        if (categoriesData) {
          setCategories(categoriesData as Category[]);
        }
      }
      
      if (settings.enabledFeatures.banks) {
        // Use our custom query utility for banks
        const { data: banksData } = await queryCustomTable('banks')
          .select('*')
          .order('name');
          
        if (banksData) {
          setBanks(banksData as Bank[]);
        }
      }
    };
    
    fetchCategoriesAndBanks();
  }, [settings.enabledFeatures.categories, settings.enabledFeatures.banks]);
  
  // Define form schema based on settings with Persian error messages
  const formSchema = z.object({
    name: settings.requiredFields.name ? 
      z.string().min(1, { message: "نام بدهی الزامی است" }) : 
      z.string().optional(),
    amount: z.string().min(1, { message: "مبلغ بدهی الزامی است" }).refine(value => !isNaN(Number(value)) && Number(value) > 0, {
      message: "مبلغ بدهی باید عدد مثبت باشد",
    }),
    debtType: z.enum(["bank_loan", "company_loan", "friend_loan", "other"] as const, {
      required_error: "نوع بدهی را انتخاب کنید",
    }),
    category_id: settings.requiredFields.category ? 
      z.string().min(1, { message: "دسته‌بندی الزامی است" }) : 
      z.string().optional(),
    bank_id: z.string().optional(),
    dueDate: z.date({
      required_error: "تاریخ سررسید الزامی است",
    }),
    installments: z.string().min(1, { message: "تعداد اقساط الزامی است" }).refine(value => !isNaN(Number(value)) && Number(value) > 0, {
      message: "تعداد اقساط باید عدد مثبت باشد",
    }),
    description: settings.requiredFields.description ? 
      z.string().min(1, { message: "توضیحات الزامی است" }) : 
      z.string().optional(),
  });
  
  // Define form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      amount: "",
      debtType: "other",
      category_id: "",
      bank_id: "",
      installments: "1",
      description: "",
    },
  });
  
  // Format amount as user types
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove non-numeric characters
    const value = e.target.value.replace(/[^\d]/g, '');
    
    // Set raw value to form
    form.setValue("amount", value);
    
    // Format with thousand separators for display
    if (value) {
      const numValue = Number(value);
      setFormattedAmount(numValue.toLocaleString('fa-IR'));
      setAmountInWords(numberToPersianWords(numValue));
    } else {
      setFormattedAmount('');
      setAmountInWords('');
    }
  };
  
  // Watch debt type to conditionally show bank selection
  const debtType = form.watch("debtType");
  const showBankField = debtType === "bank_loan" && settings.enabledFeatures.banks;

  // Update bank field requirement based on debt type
  useEffect(() => {
    if (debtType === "bank_loan" && settings.requiredFields.bank) {
      form.register("bank_id", { required: "انتخاب بانک الزامی است" });
    } else {
      form.unregister("bank_id");
    }
  }, [debtType, form, settings.requiredFields.bank]);

  // Handle form submit
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setFormErrors([]);
      
      // Convert amount to number
      const amount = Number(values.amount);
      
      // Calculate installment amount
      const installments = Number(values.installments);
      const installmentAmount = Math.ceil(amount / installments);
      
      // Format due date
      const dueDate = format(values.dueDate, 'yyyy-MM-dd');
      
      // Create debt object
      const newDebt: Omit<Debt, "id" | "createdAt"> = {
        name: values.name,
        amount,
        debtType: values.debtType as DebtType,
        dueDate,
        installments,
        installmentAmount,
        description: values.description || "",
        status: "pending",
        category_id: values.category_id || undefined,
        bank_id: values.debtType === "bank_loan" ? values.bank_id : undefined,
      };
      
      // Add debt
      await onAddDebt(newDebt);
      
      // Navigate to debts list
      navigate("/debts");
    } catch (error: any) {
      console.error("Error adding debt:", error);
      setFormErrors([
        `خطا در ثبت بدهی: ${error.message || 'لطفاً دوباره تلاش کنید'}`
      ]);
    }
  };

  return (
    <div dir="rtl">
      <h1 className="text-2xl font-bold mb-6 text-right">افزودن بدهی جدید</h1>
      
      {formErrors.length > 0 && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>
            <ul className="list-disc pl-5 text-right">
              {formErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Custom debt name */}
              {(settings.requiredFields.name || !settings.requiredFields.name) && (
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-right block">
                        نام بدهی {settings.requiredFields.name && <span className="text-red-500">*</span>}
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="مثال: وام مسکن" {...field} className="text-right" />
                      </FormControl>
                      <FormMessage className="text-right" />
                    </FormItem>
                  )}
                />
              )}
              
              {/* Debt amount */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field: { onChange, ...restField } }) => (
                  <FormItem>
                    <FormLabel className="text-right block">مبلغ بدهی (ریال) *</FormLabel>
                    <FormControl>
                      <div className="space-y-1">
                        <Input 
                          type="text"
                          placeholder="مثال: 500000000" 
                          onChange={handleAmountChange}
                          value={formattedAmount}
                          className="text-right"
                          {...restField} 
                        />
                        {amountInWords && (
                          <p className="text-xs text-gray-500 text-right">{amountInWords}</p>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage className="text-right" />
                  </FormItem>
                )}
              />
              
              {/* Debt type */}
              <FormField
                control={form.control}
                name="debtType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-right block">نوع بدهی *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="text-right">
                          <SelectValue placeholder="انتخاب نوع بدهی" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="bank_loan">وام بانکی</SelectItem>
                        <SelectItem value="company_loan">وام شرکتی</SelectItem>
                        <SelectItem value="friend_loan">قرض از دوست/خانواده</SelectItem>
                        <SelectItem value="other">بدهی دیگر</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-right" />
                  </FormItem>
                )}
              />
              
              {/* Category selection - conditional */}
              {settings.enabledFeatures.categories && (
                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-right block">
                        دسته‌بندی
                        {settings.requiredFields.category && <span className="text-red-500">*</span>}
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="text-right">
                            <SelectValue placeholder="انتخاب دسته‌بندی" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-right" />
                    </FormItem>
                  )}
                />
              )}
              
              {/* Bank selection - conditional */}
              {showBankField && (
                <FormField
                  control={form.control}
                  name="bank_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-right block">
                        نام بانک
                        {settings.requiredFields.bank && <span className="text-red-500">*</span>}
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="text-right">
                            <SelectValue placeholder="انتخاب بانک" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {banks.map((bank) => (
                            <SelectItem key={bank.id} value={bank.id}>
                              {bank.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-right" />
                    </FormItem>
                  )}
                />
              )}
              
              {/* Due date */}
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-right block">تاریخ سررسید *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-right font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "yyyy/MM/dd")
                            ) : (
                              <span>انتخاب تاریخ</span>
                            )}
                            <CalendarIcon className="mr-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date("1380-01-01")}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage className="text-right" />
                  </FormItem>
                )}
              />
              
              {/* Number of installments */}
              <FormField
                control={form.control}
                name="installments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-right block">تعداد اقساط *</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} className="text-right" />
                    </FormControl>
                    <FormMessage className="text-right" />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Description */}
            {(settings.requiredFields.description || !settings.requiredFields.description) && (
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-right block">
                      توضیحات
                      {settings.requiredFields.description && <span className="text-red-500">*</span>}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="توضیحات بیشتر درباره این بدهی..."
                        className="resize-none text-right"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-right" />
                  </FormItem>
                )}
              />
            )}
            
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
              >
                انصراف
              </Button>
              <Button type="submit">ثبت بدهی</Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default AddDebtForm;
