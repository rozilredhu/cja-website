import { CA_PROVINCES } from "../types";

type Props = {
  action: string;
  q?: string;
  city?: string;
  province?: string;
  cities?: string[];
  placeholder?: string;
};

/** GET form — query params drive SQL LIKE + city/province filters. */
export function DirectorySearchForm({
  action,
  q = "",
  city = "",
  province = "",
  cities = [],
  placeholder = "Search…",
}: Props) {
  return (
    <form method="get" action={action} className="directory-search">
      <label className="directory-search-q">
        <span className="sr-only">Search</span>
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder={placeholder}
          autoComplete="off"
        />
      </label>
      <label>
        City
        <select name="city" defaultValue={city}>
          <option value="">All cities</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
      <label>
        Province
        <select name="province" defaultValue={province}>
          <option value="">All provinces</option>
          {CA_PROVINCES.map((p) => (
            <option key={p.code} value={p.code}>
              {p.code} — {p.name}
            </option>
          ))}
        </select>
      </label>
      <button type="submit" className="btn-primary">
        Search
      </button>
      {q || city || province ? (
        <a className="btn-secondary" href={action}>
          Clear
        </a>
      ) : null}
    </form>
  );
}
