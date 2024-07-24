import { useState, useEffect } from 'react';
import axios from 'axios';

interface Invoice {
  _id: string;
  client: string;
  items: string[];
  amount: number;
  recurring: boolean;
  date: string;
}

const useInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:9443/api/financeiro/invoices');
      setInvoices(response.data.invoices);
    } catch (err) {
      setError('Error fetching invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return { invoices, loading, error, fetchInvoices };
};

export default useInvoices;
