import axios from 'axios';
import { useState, useEffect } from 'react';

const useInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        'https://api.attualizecontabil.com.br/api/financeiro/invoices'
      );
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
