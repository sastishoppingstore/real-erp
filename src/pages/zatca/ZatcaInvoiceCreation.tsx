/**
 * COMPLETE ZATCA INVOICE CREATION — React Component
 * Full 0-100 implementation
 * Saudi Arabia compliance invoice generation
 */

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, CheckCircle, Loader2, Download, QrCode } from 'lucide-react';
import { trpc } from '@/lib/trpc';

// ============ SCHEMA ============

const ZatcaInvoiceSchema = z.object({
  invoiceNumber: z.string().min(1, 'Invoice number required'),
  date: z.string().datetime('Invalid date'),
  invoiceType: z.enum(['standard', 'simplified']),
  paymentType: z.enum(['cash', 'credit', 'both']),
  customerName: z.string().optional(),
  items: z.array(z.object({
    description: z.string().min(1),
    quantity: z.number().positive(),
    unitPrice: z.number().positive(),
    taxPercent: z.number().default(15),
    itemCode: z.string().optional(),
  })).min(1, 'At least one item required'),
  discountPercent: z.number().default(0).max(100),
  notes: z.string().optional(),
});

type ZatcaInvoiceFormData = z.infer<typeof ZatcaInvoiceSchema>;

// ============ COMPONENT ============

export default function ZatcaInvoiceCreation() {
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generatedInvoice, setGeneratedInvoice] = useState<any>(null);

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<ZatcaInvoiceFormData>({
    resolver: zodResolver(ZatcaInvoiceSchema),
    defaultValues: {
      invoiceType: 'standard',
      paymentType: 'cash',
      discountPercent: 0,
      items: [{ description: '', quantity: 1, unitPrice: 0, taxPercent: 15 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const zatcaMutation = trpc.zatcaComplete.invoiceCreate.useMutation();

  // Calculate totals
  const items = watch('items');
  const discountPercent = watch('discountPercent');

  const calculateTotals = () => {
    let subtotal = 0;
    items.forEach((item) => {
      if (item && item.quantity && item.unitPrice) {
        subtotal += item.quantity * item.unitPrice;
      }
    });

    const discountAmount = subtotal * (discountPercent / 100);
    const taxableAmount = subtotal - discountAmount;
    const vatAmount = taxableAmount * 0.15;
    const totalAmount = taxableAmount + vatAmount;

    return {
      subtotal,
      discountAmount: discountAmount.toFixed(2),
      taxableAmount: taxableAmount.toFixed(2),
      vatAmount: vatAmount.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
    };
  };

  const totals = calculateTotals();

  // Submit handler
  const onSubmit = async (data: ZatcaInvoiceFormData) => {
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const result = await zatcaMutation.mutateAsync({
        invoiceNumber: data.invoiceNumber,
        date: new Date(data.date).toISOString(),
        invoiceType: data.invoiceType,
        paymentType: data.paymentType,
        customerName: data.customerName,
        items: data.items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxPercent: item.taxPercent,
          itemCode: item.itemCode,
        })),
        discountPercent: data.discountPercent,
        notes: data.notes,
      });

      setGeneratedInvoice(result);
      setSuccessMessage(`✅ Invoice ${result.invoiceNumber} created successfully!`);
      reset();
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          ZATCA Invoice Generator
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Saudi Arabia Compliant Invoice — Up to 750,000 SAR
        </p>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <Card className="bg-green-50 border-green-200 p-4 flex items-start gap-3">
          <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-green-900">{successMessage}</h3>
            {generatedInvoice && (
              <div className="mt-3 space-y-2 text-sm text-green-800">
                <p><strong>Invoice UUID:</strong> {generatedInvoice.invoiceUuid}</p>
                <p><strong>Total Amount:</strong> SAR {generatedInvoice.totalAmount}</p>
                {generatedInvoice.qrImage && (
                  <div className="mt-3">
                    <img
                      src={generatedInvoice.qrImage}
                      alt="ZATCA QR Code"
                      className="w-40 h-40 border-2 border-green-300 p-2 bg-white"
                    />
                    <Button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = generatedInvoice.qrImage;
                        link.download = `zatca-qr-${generatedInvoice.invoiceNumber}.png`;
                        link.click();
                      }}
                      className="mt-2 flex items-center gap-2"
                      variant="outline"
                    >
                      <Download className="h-4 w-4" />
                      Download QR Code
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      )}

      {errorMessage && (
        <Card className="bg-red-50 border-red-200 p-4 flex items-start gap-3">
          <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Error</h3>
            <p className="text-red-800 text-sm">{errorMessage}</p>
          </div>
        </Card>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Invoice Header Section */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Invoice Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Invoice Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Invoice Number *
              </label>
              <Input
                {...register('invoiceNumber')}
                placeholder="INV-001 or BILL-2026-001"
                className="w-full"
              />
              {errors.invoiceNumber && (
                <p className="text-red-500 text-sm mt-1">{errors.invoiceNumber.message}</p>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date & Time *
              </label>
              <Input
                {...register('date')}
                type="datetime-local"
                defaultValue={new Date().toISOString().slice(0, 16)}
                className="w-full"
              />
              {errors.date && (
                <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
              )}
            </div>

            {/* Invoice Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Invoice Type
              </label>
              <Select {...register('invoiceType')} defaultValue="standard">
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard (Full UBL)</SelectItem>
                  <SelectItem value="simplified">Simplified (QR Only)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Payment Type
              </label>
              <Select {...register('paymentType')} defaultValue="cash">
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="credit">Credit</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Customer Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Customer Name (Optional)
              </label>
              <Input
                {...register('customerName')}
                placeholder="Customer name or leave blank for cash customer"
                className="w-full"
              />
            </div>
          </div>
        </Card>

        {/* Line Items */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Line Items</h2>
          <div className="space-y-4">
            {fields.map((field, idx) => (
              <div key={field.id} className="p-4 border border-gray-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Item {idx + 1}</h3>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => remove(idx)}
                      variant="destructive"
                      size="sm"
                    >
                      Remove
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description *
                    </label>
                    <Input
                      {...register(`items.${idx}.description`)}
                      placeholder="Product or service description"
                    />
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Quantity *
                    </label>
                    <Input
                      {...register(`items.${idx}.quantity`, { valueAsNumber: true })}
                      type="number"
                      placeholder="1"
                      min="0.01"
                      step="0.01"
                    />
                  </div>

                  {/* Unit Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Unit Price (SAR) *
                    </label>
                    <Input
                      {...register(`items.${idx}.unitPrice`, { valueAsNumber: true })}
                      type="number"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  {/* Item Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Item Code (Optional)
                    </label>
                    <Input
                      {...register(`items.${idx}.itemCode`)}
                      placeholder="SKU or product code"
                    />
                  </div>

                  {/* VAT Percent (usually fixed at 15%) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      VAT %
                    </label>
                    <Input
                      {...register(`items.${idx}.taxPercent`, { valueAsNumber: true })}
                      type="number"
                      defaultValue={15}
                      disabled
                      className="bg-gray-100"
                    />
                  </div>

                  {/* Line Total Display */}
                  {items[idx] && items[idx].quantity && items[idx].unitPrice && (
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Line Total: SAR{' '}
                        {(items[idx].quantity * items[idx].unitPrice).toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Add Item Button */}
            <Button
              type="button"
              onClick={() =>
                append({
                  description: '',
                  quantity: 1,
                  unitPrice: 0,
                  taxPercent: 15,
                  itemCode: '',
                })
              }
              variant="outline"
              className="w-full"
            >
              + Add Item
            </Button>
          </div>
        </Card>

        {/* Discount & Totals */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Discount & Totals</h2>
          <div className="space-y-4">
            {/* Discount */}
            <div className="max-w-xs">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Discount % (0-100)
              </label>
              <Input
                {...register('discountPercent', { valueAsNumber: true })}
                type="number"
                min="0"
                max="100"
                step="0.01"
                defaultValue={0}
              />
            </div>

            {/* Totals Summary */}
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg space-y-2 text-sm font-medium">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>SAR {totals.subtotal}</span>
              </div>
              {Number(totals.discountAmount) > 0 && (
                <div className="flex justify-between text-orange-600">
                  <span>Discount ({discountPercent}%):</span>
                  <span>-SAR {totals.discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Taxable Amount:</span>
                <span>SAR {totals.taxableAmount}</span>
              </div>
              <div className="flex justify-between text-blue-600">
                <span>VAT (15%):</span>
                <span>SAR {totals.vatAmount}</span>
              </div>
              <div className="border-t border-gray-300 pt-2 flex justify-between text-lg font-bold text-green-700">
                <span>Total (with VAT):</span>
                <span>SAR {totals.totalAmount}</span>
              </div>
              {Number(totals.totalAmount) > 750000 && (
                <div className="text-red-600 text-xs mt-2">
                  ⚠️ Amount exceeds 750,000 SAR limit
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Notes */}
        <Card className="p-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Additional Notes (Optional)
          </label>
          <textarea
            {...register('notes')}
            placeholder="Payment terms, delivery instructions, etc."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
        </Card>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading || zatcaMutation.isPending}
          className="w-full h-12 text-lg bg-green-600 hover:bg-green-700"
        >
          {loading || zatcaMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generating ZATCA Invoice...
            </>
          ) : (
            <>
              <QrCode className="mr-2 h-5 w-5" />
              Generate ZATCA Invoice
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
