'use client';

import { useState } from 'react';
import { abbreviationsService, ApiError } from '@/services';
import { useToast } from '@/context/ToastContext';
import { TextArea } from '@/components/ui/Fields';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { toCsv, downloadCsv } from '@/lib/csv';

const EXPORT_COLUMNS = [
  { key: 'query', label: 'Word / phrase' },
  { key: 'result', label: 'Abbreviation' },
];

/**
 * Form + results table for the abbreviations lookup. Multiple words/phrases
 * are entered comma-separated; each one may itself be several words joined
 * by an underscore or a space. A word with no dictionary match is returned
 * exactly as typed, never blanked out.
 */
export function AbbreviationsLookupForm() {
  const [input, setInput] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const { notify } = useToast();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!input.trim()) {
      notify('Enter at least one word or phrase.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const data = await abbreviationsService.lookup(input);
      setResults(data.results);
    } catch (error) {
      notify(error instanceof ApiError ? error.message : 'The lookup could not be completed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!results?.length) return;
    downloadCsv('abbreviations.csv', toCsv(results, EXPORT_COLUMNS));
  };

  return (
    <div className="u-stack">
      <form className="admin-form" onSubmit={handleSubmit} noValidate>
        <TextArea
          label="Word, phrase or sentence"
          name="input"
          value={input}
          onChange={(_name, value) => setInput(value)}
          rows={3}
          hint="Separate multiple entries with a comma, e.g. Customer_transaction, Account_number"
        />
        <div className="admin-form__actions">
          <Button type="submit" icon="Search" loading={loading}>
            Look up
          </Button>
        </div>
      </form>

      {results ? (
        <div className="card card--flat">
          <div className="card__body u-stack">
            <div className="u-cluster u-cluster--sm u-cluster--between">
              <h2 className="u-text-sm u-muted">
                {results.length} result{results.length === 1 ? '' : 's'}
              </h2>
              <Button variant="outline" size="sm" icon="Download" onClick={handleExport}>
                Export CSV
              </Button>
            </div>

            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Word / phrase</th>
                    <th>Abbreviation</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((row, index) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <tr key={`${row.query}-${index}`}>
                      <td>{row.query}</td>
                      <td>
                        {row.result}
                        {!row.matched ? (
                          <span className="u-text-xs u-subtle u-cluster u-cluster--sm">
                            <Icon name="InfoOutlined" fontSize="inherit" /> no match found - showing original
                          </span>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default AbbreviationsLookupForm;
