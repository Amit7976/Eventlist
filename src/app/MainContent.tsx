"use client";
import { useState } from "react";
import measurementsJson from "@/lib/data/measurements.json";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import axios from "axios";
import { Scissors, User, Ruler, Calendar as CalendarIcon, ShoppingBag, ArrowRight } from "lucide-react";

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

interface MeasurementField {
    key: string;
    label: string;
    type: string;
    unit: string;
}

interface Subcategory {
    id: string;
    name: string;
    measurements: MeasurementField[];
}

interface Category {
    id: string;
    name: string;
    subcategories: Subcategory[];
}

const measurementsData = measurementsJson as { categories: Category[] };

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const formSchema = z.object({
    shopName: z.string().min(1, "Shop name is required"),
    clientName: z.string().optional(),
    clientNumber: z.string()
        .optional()
        .refine((val) => !val || val.length >= 10, {
            message: "Phone number must be at least 10 digits",
        }),

    deliveryDate: z.string().min(1, "Required"),
    pickupDate: z.string().min(1, "Required"),

    category: z.string().min(1, "Select category"),
    subcategory: z.string().min(1, "Select subcategory"),

    measurements: z.record(
        z.string(),
        z
            .number({ invalid_type_error: "Enter a valid number" })
            .min(0, "Min 0")
            .max(100, "Max 100")
            .or(z.nan())
    ),
});

type FormValues = z.infer<typeof formSchema>;

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export default function Page() {
    const today = new Date().toISOString().split("T")[0];
    const [loading, setLoading] = useState(false);
    const [category, setCategory] = useState<string>("");
    const [subcategory, setSubcategory] = useState<string>("");
    const selectedCategory = measurementsData.categories.find((c) => c.id === category);
    const selectedSubcategory = selectedCategory?.subcategories.find((s) => s.id === subcategory);

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            shopName: "",
            clientName: "",
            clientNumber: "",
            deliveryDate: today,
            pickupDate: today,
            category: "",
            subcategory: "",
            measurements: {},
        },
    });

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const onSubmit: SubmitHandler<FormValues> = async (data) => {
        try {
            setLoading(true);
            await axios.post("/api/order", data);
            alert("Order submitted successfully!");
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Failed to submit order";
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    return (
        <main className="min-h-screen bg-neutral-900 py-16 px-4 sm:px-6 font-sans text-neutral-900 selection:bg-neutral-900 selection:text-white">
            <div className="max-w-4xl mx-auto space-y-12">

                {/* Header */}
                <div className="text-center space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-900 text-white mb-2 shadow-2xl shadow-neutral-900/20 ring-4 ring-white">
                        <Scissors className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-5xl font-serif text-white tracking-tight">
                            Concierge Measurements
                        </h1>
                        <p className="text-neutral-400 font-medium text-xs tracking-[0.3em] uppercase mt-3">
                            Tailoring Service
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">

                    {/* ------------------ CUSTOMER CARD ------------------ */}
                    <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white backdrop-blur-md rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                        <div className="px-8 py-6 border-b border-neutral-100/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500">
                                    <User className="w-4 h-4" />
                                </span>
                                <h2 className="text-sm font-bold text-neutral-900 tracking-[0.2em] uppercase">
                                    Client Profile
                                </h2>
                            </div>
                        </div>
                        <CardContent className="px-8 md:px-10 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">

                            {/* Shop Name */}
                            <div className="space-y-3 md:col-span-2 group">
                                <Label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-bold group-focus-within:text-neutral-900 transition-colors">
                                    Shop Name
                                </Label>
                                <Input
                                    {...register("shopName")}
                                    placeholder="e.g. Royal Boutique"
                                    className="h-14 bg-white/50 border-2 hover:bg-white focus:bg-white focus:border-neutral-200 focus:ring-4 focus:ring-neutral-100 rounded-xl transition-all duration-300 text-lg font-medium shadow-sm hover:shadow-md"
                                />
                                {errors.shopName && (
                                    <p className="text-red-500 text-xs mt-2 pl-1 font-medium animate-in slide-in-from-top-1">{errors.shopName.message}</p>
                                )}
                            </div>

                            {/* Client Name */}
                            <div className="space-y-3 group">
                                <Label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-bold group-focus-within:text-neutral-900 transition-colors">
                                    Client Name
                                </Label>
                                <Input
                                    {...register("clientName")}
                                    placeholder="e.g. Roshni Sharma"
                                    className="h-14 bg-white/50 border-2 hover:bg-white focus:bg-white focus:border-neutral-200 focus:ring-4 focus:ring-neutral-100 rounded-xl transition-all duration-300 text-base shadow-sm hover:shadow-md"
                                />
                            </div>

                            {/* Client Number */}
                            <div className="space-y-3 group">
                                <Label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-bold group-focus-within:text-neutral-900 transition-colors">
                                    Client Number
                                </Label>
                                <Input
                                    {...register("clientNumber")}
                                    placeholder="e.g. 9876543210"
                                    className="h-14 bg-white/50 border-2 hover:bg-white focus:bg-white focus:border-neutral-200 focus:ring-4 focus:ring-neutral-100 rounded-xl transition-all duration-300 text-base shadow-sm hover:shadow-md"
                                />
                                {errors.clientNumber && (
                                    <p className="text-red-500 text-xs mt-2 pl-1 font-medium animate-in slide-in-from-top-1">{errors.clientNumber.message}</p>
                                )}
                            </div>

                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-12 pt-2">
                                {/* Pickup Date */}
                                <div className="space-y-3 group">
                                    <Label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-bold group-focus-within:text-neutral-900 transition-colors">
                                        Pickup Date
                                    </Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full justify-start text-left font-normal h-14 bg-white/50 border-2 hover:bg-white focus:bg-white focus:border-neutral-200 focus:ring-4 focus:ring-neutral-100 rounded-xl transition-all duration-300 text-base shadow-sm hover:shadow-md",
                                                    !watch("pickupDate") && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {watch("pickupDate") ? format(new Date(watch("pickupDate")), "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={watch("pickupDate") ? new Date(watch("pickupDate")) : undefined}
                                                onSelect={(date) => setValue("pickupDate", date ? format(date, "yyyy-MM-dd") : "")}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                {/* Delivery Date */}
                                <div className="space-y-3 group">
                                    <Label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-bold group-focus-within:text-neutral-900 transition-colors">
                                        Delivery Date
                                    </Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full justify-start text-left font-normal h-14 bg-white/50 border-2 hover:bg-white focus:bg-white focus:border-neutral-200 focus:ring-4 focus:ring-neutral-100 rounded-xl transition-all duration-300 text-base shadow-sm hover:shadow-md",
                                                    !watch("deliveryDate") && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {watch("deliveryDate") ? format(new Date(watch("deliveryDate")), "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={watch("deliveryDate") ? new Date(watch("deliveryDate")) : undefined}
                                                onSelect={(date) => setValue("deliveryDate", date ? format(date, "yyyy-MM-dd") : "")}
                                                disabled={watch("pickupDate") ? { before: new Date(watch("pickupDate")) } : undefined}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    {errors.deliveryDate && (
                                        <p className="text-red-500 text-xs mt-2 pl-1 font-medium animate-in slide-in-from-top-1">{errors.deliveryDate.message}</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* ------------------ SELECTION CARD ------------------ */}
                    <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white backdrop-blur-md rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                        <div className="px-8 py-6 border-b border-neutral-100/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500">
                                    <ShoppingBag className="w-4 h-4" />
                                </span>
                                <h2 className="text-sm font-bold text-neutral-900 tracking-[0.2em] uppercase">
                                    Selection
                                </h2>
                            </div>
                        </div>
                        <CardContent className="px-8 md:px-10 grid grid-cols-1 md:grid-cols-2 gap-12">

                            {/* Category */}
                            <div className="space-y-3 group">
                                <Label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-bold group-focus-within:text-neutral-900 transition-colors">Category</Label>
                                <Select
                                    onValueChange={(v) => {
                                        setCategory(v);
                                        setSubcategory("");
                                        setValue("category", v);
                                        setValue("subcategory", "");
                                    }}
                                >
                                    <SelectTrigger className="h-14 bg-white/50 border-2 hover:bg-white focus:bg-white focus:border-neutral-200 focus:ring-4 focus:ring-neutral-100 rounded-xl transition-all duration-300 text-base shadow-sm hover:shadow-md">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>

                                    <SelectContent className="rounded-xl shadow-xl">
                                        {measurementsData.categories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id} className="cursor-pointer py-3 px-4 focus:bg-neutral-50 text-neutral-600 focus:text-neutral-900">
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {errors.category && (
                                    <p className="text-red-500 text-xs mt-2 pl-1 font-medium animate-in slide-in-from-top-1">{errors.category.message}</p>
                                )}
                            </div>

                            {/* Subcategory */}
                            <div className="space-y-3 group">
                                <Label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-bold group-focus-within:text-neutral-900 transition-colors">Style</Label>
                                <Select
                                    disabled={!category}
                                    onValueChange={(v) => {
                                        setSubcategory(v);
                                        const selectedSub = selectedCategory?.subcategories.find((s) => s.id === v);
                                        if (selectedSub) {
                                            setValue("subcategory", selectedSub.name);
                                        }
                                    }}
                                >
                                    <SelectTrigger className="h-14 bg-white/50 border-2 hover:bg-white focus:bg-white focus:border-neutral-200 focus:ring-4 focus:ring-neutral-100 rounded-xl transition-all duration-300 text-base shadow-sm hover:shadow-md disabled:opacity-50">
                                        <SelectValue placeholder={category ? "Select style" : "Choose category first"} />
                                    </SelectTrigger>

                                    <SelectContent className="rounded-xl shadow-xl">
                                        {selectedCategory?.subcategories.map((sub) => (
                                            <SelectItem key={sub.id} value={sub.id} className="cursor-pointer py-3 px-4 focus:bg-neutral-50 text-neutral-600 focus:text-neutral-900">
                                                {sub.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {errors.subcategory && (
                                    <p className="text-red-500 text-xs mt-2 pl-1 font-medium animate-in slide-in-from-top-1">{errors.subcategory.message}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* ------------------ MEASUREMENTS CARD ------------------ */}
                    {subcategory && selectedSubcategory && (
                        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white backdrop-blur-xl rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 ring-1 ring-neutral-900/5">
                            <div className="bg-neutral-900 px-8 py-6 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/80">
                                        <Ruler className="w-4 h-4" />
                                    </span>
                                    <h2 className="text-sm font-bold text-white tracking-[0.2em] uppercase">
                                        Measurements
                                    </h2>
                                </div>
                                <span className="text-[10px] font-bold bg-white text-neutral-900 px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                                    {selectedSubcategory.name}
                                </span>
                            </div>
                            <CardContent className="px-8 md:px-12">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10">
                                    {selectedSubcategory.measurements.map((m) => (
                                        <div key={m.key} className="space-y-3 group relative">
                                            <Label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-bold group-focus-within:text-neutral-900 transition-colors flex justify-between">
                                                {m.label} <span className="text-neutral-500 font-medium">({m.unit})</span>
                                            </Label>

                                            <Input
                                                type="number"
                                                step="0.1"
                                                min={0}
                                                max={100}
                                                {...register(`measurements.${m.key}`, {
                                                    valueAsNumber: true,
                                                })}
                                                onKeyDown={(e) => {
                                                    if (["e", "E", "+", "-"].includes(e.key)) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                onChange={(e) => {
                                                    const v = e.target.value;
                                                    if (v === "") return;
                                                    if (Number(v) > 100) {
                                                        e.target.value = v.slice(0, -1);
                                                    }
                                                }}
                                                className="h-14 bg-neutral-50/50 border-2 hover:bg-neutral-50 focus:bg-white focus:border-neutral-200 focus:ring-4 focus:ring-neutral-100 rounded-xl transition-all duration-300 text-lg font-medium shadow-sm hover:shadow-md text-center"
                                                placeholder="0.0"
                                            />

                                            {errors.measurements?.[m.key] && (
                                                <p className="absolute -bottom-6 left-1 text-red-500 text-[10px] font-medium animate-in slide-in-from-top-1">
                                                    {errors.measurements[m.key]?.message}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* ------------------ SUBMIT ------------------ */}
                    <div className="pt-4 flex justify-center pb-20">
                        <Button
                            type="submit"
                            className="group relative h-16 pl-10 pr-8 text-neutral-900 bg-white hover:bg-neutral-50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-500 rounded-full border border-neutral-100 overflow-hidden"
                            disabled={loading}
                        >
                            <span className="relative z-10 flex items-center gap-4 text-sm font-bold uppercase tracking-[0.2em]">
                                {loading ? "Processing..." : "Confirm Final Order"}
                                <span className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <ArrowRight className="w-4 h-4" />
                                </span>
                            </span>
                            {loading && (
                                <div className="absolute inset-0 bg-neutral-50/80 backdrop-blur-sm z-20 flex items-center justify-center">
                                    <div className="w-5 h-5 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
                                </div>
                            )}
                        </Button>
                    </div>

                </form>
            </div>
        </main>
    );
}
