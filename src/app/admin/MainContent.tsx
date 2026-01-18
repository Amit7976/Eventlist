"use client";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import measurementsData from "@/lib/data/measurements.json";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar1, CalendarIcon, ChevronLeft, ChevronRight, Eye, FilterX, LogOut, RefreshCcw, Search, SlidersHorizontal, Store, User } from "lucide-react";
import { signOut } from "next-auth/react";

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

interface OrderType {
    _id: string;
    shopName: string;
    clientName?: string;
    clientNumber?: string;
    category: string;
    subcategory: string;
    createdAt: string;
    deliveryDate?: string;
    pickupDate?: string;
    measurements?: Record<string, unknown>;
    status?: string;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export default function MainContent() {
    const [orders, setOrders] = useState<OrderType[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);
    const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [shopFilter, setShopFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");
    const [subCategoryFilter, setSubCategoryFilter] = useState<string>("all");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const selectedCategoryData = useMemo(() => {
        return measurementsData.categories.find((c) => c.id === categoryFilter);
    }, [categoryFilter]);
    const isFiltersActive = shopFilter || categoryFilter !== "all" || startDate || endDate;

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await axios.get("/api/order", {
                params: {
                    page,
                    limit: 10,
                    shop: shopFilter,
                    category: categoryFilter === "all" ? "" : categoryFilter,
                    subcategory: subCategoryFilter === "all" ? "" : subCategoryFilter,
                    startDate,
                    endDate,
                },
            });

            setOrders(res.data.orders || []);
            setTotalPages(res.data.pages || 1);
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const fetchOrderDetails = async (id: string) => {
        try {
            setDetailsLoading(true);
            setSelectedOrder(null);
            const res = await axios.get(`/api/order/${id}`);
            setSelectedOrder(res.data.order);
        } catch (error) {
            console.error("Error fetching details", error);
        } finally {
            setDetailsLoading(false);
        }
    };

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    useEffect(() => {
        fetchOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, shopFilter, categoryFilter, subCategoryFilter, startDate, endDate, refreshKey]);

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const handleCategoryChange = (val: string) => {
        setCategoryFilter(val);
        setSubCategoryFilter("all");
        setPage(1);
    };

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const clearFilters = () => {
        setShopFilter("");
        setCategoryFilter("all");
        setSubCategoryFilter("all");
        setStartDate("");
        setEndDate("");
        setPage(1);
    };

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const formatDate = (dateString?: string) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20 font-sans">

            <header className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
                <div className="px-4 sm:px-6 lg:px-16 h-16 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div>
                            <h1 className="text-lg font-bold text-gray-900 tracking-tight leading-none line-clamp-1">Deeja Admin Panel</h1>
                            <p className="text-xs line-clamp-1 font-medium text-gray-400 mt-0.5 uppercase tracking-wider">Dashboard & Controls</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setRefreshKey((prev) => prev + 1)}
                            className="bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 h-9 hidden sm:flex"
                        >
                            <RefreshCcw className="w-3.5 h-3.5 mr-2" />
                            Refresh
                        </Button>
                        <Separator orientation="vertical" className="h-6 mx-1 hidden sm:block" />
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => signOut()}
                            className="h-12 w-40 shadow-sm hover:shadow transition-all"
                        >
                            <LogOut className="w-3.5 h-3.5 mr-2" />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </header>

            <main className="px-4 sm:px-6 lg:px-14 py-8 space-y-6">

                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-gray-800 font-semibold mb-2 lg:mb-0">
                            <SlidersHorizontal className="w-4 h-4 text-primary" />
                            <span>Filters & Search</span>
                        </div>
                        {isFiltersActive && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearFilters}
                                className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50 w-full lg:w-auto"
                            >
                                <FilterX className="w-3.5 h-3.5 mr-2" />
                                Clear All
                            </Button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                        {/* Search Shop */}
                        <div className="relative group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                                <Search className="w-4 h-4" />
                            </div>
                            <Input
                                placeholder="Search by shop..."
                                value={shopFilter}
                                onChange={(e) => setShopFilter(e.target.value)}
                                className="pl-9 bg-gray-50/50 border-gray-200 focus:bg-white transition-all h-11"
                            />
                        </div>

                        {/* Category */}
                        <Select value={categoryFilter} onValueChange={handleCategoryChange}>
                            <SelectTrigger className="bg-gray-50/50 border-gray-200 focus:bg-white data-[size=default]:h-11">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {measurementsData.categories.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Sub Category */}
                        <Select
                            value={subCategoryFilter}
                            onValueChange={setSubCategoryFilter}
                            disabled={categoryFilter === "all"}
                        >
                            <SelectTrigger className="bg-gray-50/50 border-gray-200 focus:bg-white disabled:opacity-50 data-[size=default]:h-11">
                                <SelectValue placeholder="Subcategory" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Subcategories</SelectItem>
                                {selectedCategoryData?.subcategories.map((sub) => (
                                    <SelectItem key={sub.id} value={sub.id}>
                                        {sub.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Start Date */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal h-11 bg-gray-50/50 border-gray-200 hover:bg-white",
                                        !startDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {startDate ? format(new Date(startDate), "PPP") : <span className="text-gray-500">Start Date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={startDate ? new Date(startDate) : undefined}
                                    onSelect={(date) => setStartDate(date ? format(date, "yyyy-MM-dd") : "")}
                                    disabled={endDate ? { after: new Date(endDate) } : undefined}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>

                        {/* End Date */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal h-11 bg-gray-50/50 border-gray-200 hover:bg-white",
                                        !endDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {endDate ? format(new Date(endDate), "PPP") : <span className="text-gray-500">End Date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={endDate ? new Date(endDate) : undefined}
                                    onSelect={(date) => setEndDate(date ? format(date, "yyyy-MM-dd") : "")}
                                    disabled={startDate ? { before: new Date(startDate) } : undefined}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                <Card className="shadow-lg border-0 ring-1 ring-gray-100 overflow-hidden bg-white">
                    <CardHeader className="border-b border-gray-100 px-6 py-4 bg-white">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-semibold text-gray-800">Recent Orders</CardTitle>
                            <div className="text-sm text-gray-500">
                                Showing <span className="font-medium text-gray-900">{orders.length}</span> results
                            </div>
                        </div>
                    </CardHeader>
                    <div className="p-0">
                        {loading ? (
                            <div className="h-96 flex flex-col items-center justify-center space-y-4 bg-white/50">
                                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                <p className="text-sm font-medium text-gray-500 animate-pulse">Fetching records...</p>
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="h-96 flex flex-col items-center justify-center space-y-3 bg-gray-50/30">
                                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                    <Search className="w-8 h-8" />
                                </div>
                                <p className="text-gray-900 font-medium">No orders found</p>
                                <p className="text-gray-500 text-sm max-w-xs text-center">We couldn&apos;t find any orders matching your filters. Try adjusting your search criteria.</p>
                                <Button variant="outline" size="sm" onClick={clearFilters} className="mt-2">
                                    Clear Filters
                                </Button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-gray-50 border-b border-gray-100">
                                        <TableRow className="hover:bg-gray-50 border-gray-100">
                                            <TableHead className="font-semibold text-xs uppercase tracking-wider text-gray-500 px-6 py-4 min-w-40">Shop & Client</TableHead>
                                            <TableHead className="font-semibold text-xs uppercase tracking-wider text-gray-500 px-6 py-4 min-w-40">Category Detail</TableHead>
                                            <TableHead className="font-semibold text-xs uppercase tracking-wider text-gray-500 px-6 py-4 min-w-40">Order Date</TableHead>
                                            <TableHead className="font-semibold text-xs uppercase tracking-wider text-gray-500 px-6 py-4 min-w-40">Delivery</TableHead>
                                            <TableHead className="text-right font-semibold text-xs uppercase tracking-wider text-gray-500 px-6 py-4">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {orders.map((order) => (
                                            <TableRow key={order._id} className="group hover:bg-gray-50/80 transition-all border-gray-100">
                                                <TableCell className="px-6 py-4">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2">
                                                            <Store className="w-3.5 h-3.5 text-gray-400" />
                                                            <span className="font-medium text-gray-900 text-sm">{order.shopName}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 pl-0.5">
                                                            <User className="w-3 h-3 text-gray-400" />
                                                            <span className="text-sm text-gray-600">{order.clientName || "Walk-in Client"}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-6 py-4">
                                                    <div className="flex flex-col gap-1.5 items-start">
                                                        <Badge
                                                            variant="secondary"
                                                            className="capitalize font-medium text-indigo-700 bg-indigo-50 border-indigo-100 hover:bg-indigo-100 px-2.5 py-0.5 rounded-md shadow-sm"
                                                        >
                                                            {order.category}
                                                        </Badge>
                                                        <span className="text-xs font-medium text-gray-500 px-1 capitalize">{order.subcategory}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-6 py-4">
                                                    <div className="flex items-center text-gray-600 text-sm font-medium">
                                                        <Calendar1 className="w-3.5 h-3.5 mr-2 text-gray-400" />
                                                        {formatDate(order.createdAt)}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-6 py-4">
                                                    <div className="text-sm">
                                                        {order.deliveryDate ? (
                                                            <span className="text-emerald-700 bg-emerald-50 px-2 py-1 rounded text-xs font-medium border border-emerald-100">
                                                                {formatDate(order.deliveryDate)}
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400 text-xs italic">Not set</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right px-6 py-4">
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        className="h-8 bg-white border border-gray-200 text-gray-600 hover:text-primary hover:border-primary/30 hover:bg-primary/5 shadow-sm transition-all"
                                                        onClick={() => {
                                                            setDialogOpen(true);
                                                            fetchOrderDetails(order._id);
                                                        }}
                                                    >
                                                        <Eye className="w-3.5 h-3.5 mr-1.5" />
                                                        Details
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>

                    {/* Pagination Footer */}
                    {!loading && orders.length > 0 && (
                        <div className="bg-gray-50 border-t border-gray-200 p-4 flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                                Page <span className="font-semibold text-gray-900">{page}</span> of <span className="font-semibold text-gray-900">{totalPages}</span>
                            </span>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page <= 1}
                                    onClick={() => setPage((p) => p - 1)}
                                    className="h-8 bg-white border-gray-300 hover:bg-gray-50 text-gray-700"
                                >
                                    <ChevronLeft className="w-4 h-4 mr-1" />
                                    Prev
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page >= totalPages}
                                    onClick={() => setPage((p) => p + 1)}
                                    className="h-8 bg-white border-gray-300 hover:bg-gray-50 text-gray-700"
                                >
                                    Next
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>

            </main>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-2xl bg-white p-0 overflow-hidden gap-0 border-0 shadow-2xl rounded-2xl">
                    <DialogHeader className="p-6 pb-4 border-b border-gray-100 bg-gray-50/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <DialogTitle className="text-xl font-bold text-gray-900">Order Details</DialogTitle>
                                <DialogDescription className="text-gray-500 mt-1">Complete order information and measurements.</DialogDescription>
                            </div>
                            {selectedOrder && (
                                <Badge className="bg-white text-gray-700 border border-gray-200 shadow-sm font-mono tracking-wide">
                                    #{selectedOrder._id.slice(-6).toUpperCase()}
                                </Badge>
                            )}
                        </div>
                    </DialogHeader>

                    <div className="p-6 max-h-[80vh] overflow-y-auto bg-white">
                        {detailsLoading ? (
                            <div className="flex flex-col items-center justify-center py-12 space-y-3">
                                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-sm text-gray-400">Loading details...</p>
                            </div>
                        ) : selectedOrder ? (
                            <div className="space-y-8">

                                {/* Meta Info Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100/50 space-y-1">
                                        <p className="text-[10px] uppercase text-indigo-400 font-bold tracking-wider">Product Info</p>
                                        <p className="font-semibold text-indigo-900 capitalize text-sm">
                                            {selectedOrder.category} / {selectedOrder.subcategory}
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100/50 space-y-1">
                                        <p className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Shop Name</p>
                                        <p className="font-semibold text-gray-900 text-sm">{selectedOrder.shopName}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100/50 space-y-1">
                                        <p className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Delivery</p>
                                        <p className="font-semibold text-gray-900 text-sm">{formatDate(selectedOrder.deliveryDate)}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100/50 space-y-1">
                                        <p className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Pickup</p>
                                        <p className="font-semibold text-gray-900 text-sm">{formatDate(selectedOrder.pickupDate)}</p>
                                    </div>
                                </div>

                                <Separator className="bg-gray-100" />

                                {/* Measurements Table */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                            Measurements
                                        </h3>
                                        <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-full uppercase tracking-wide border border-gray-200">
                                            Inches
                                        </span>
                                    </div>
                                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                                                <tr>
                                                    <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wider w-1/2">Attribute</th>
                                                    <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wider">Value</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 bg-white">
                                                {selectedOrder.measurements && Object.entries(selectedOrder.measurements).filter(([, v]) => v !== null && v !== "" && v !== undefined).length > 0 ? (
                                                    Object.entries(selectedOrder.measurements)
                                                        .filter(([, v]) => v !== null && v !== "" && v !== undefined)
                                                        .map(([k, v]) => (
                                                            <tr key={k} className="hover:bg-gray-50/50 transition-colors">
                                                                <td className="px-5 py-3 capitalize font-medium text-gray-700">{k.replace(/_/g, " ")}</td>
                                                                <td className="px-5 py-3 text-gray-900 font-semibold">{String(v)}</td>
                                                            </tr>
                                                        ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={2} className="px-5 py-8 text-center text-gray-400 italic">
                                                            No measurements recorded.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-center text-red-500">Failed to load order data.</p>
                        )}
                    </div>
                    <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                        <Button variant="outline" onClick={() => setDialogOpen(false)} className="bg-white hover:bg-gray-100 text-gray-700">Close Window</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}