'use client';

import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { formatPrice } from '@/lib/utils';

export type Product = {
  id: string;
  title: string;
  sale_price: number;
  promotional_price: number | null;
  category: { name: string } | null;
  active: boolean;
  created_at: string;
};

export const columns: ColumnDef<Product>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Selecionar todos"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Selecionar linha"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'title',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Título
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'sale_price',
    header: 'Preço',
    cell: ({ row }) => formatPrice(row.getValue('sale_price')),
  },
  {
    accessorKey: 'promotional_price',
    header: 'Preço Promocional',
    cell: ({ row }) => {
      const price = row.getValue('promotional_price');
      return price ? formatPrice(price) : '-';
    },
  },
  {
    accessorKey: 'category.name',
    header: 'Categoria',
    cell: ({ row }) => row.original.category?.name || '-',
  },
  {
    accessorKey: 'active',
    header: 'Status',
    cell: ({ row }) => (
      <span className={row.getValue('active') ? 'text-green-600' : 'text-red-600'}>
        {row.getValue('active') ? 'Ativo' : 'Inativo'}
      </span>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const product = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(product.id)}
            >
              Copiar ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/modules/catalog/products/${product.id}`}>
                Editar
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className={product.active ? 'text-red-600' : 'text-green-600'}
            >
              {product.active ? 'Desativar' : 'Ativar'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];