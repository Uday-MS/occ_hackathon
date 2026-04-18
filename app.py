from flask import Flask, render_template, request, jsonify
import pandas as pd
import numpy as np

app = Flask(__name__)

# =============================================================================
# DATA LOADING — Global dataset
# =============================================================================
df = pd.read_csv("cleaned_data.csv")

# =============================================================================
# DATA LOADING — Indian startups dataset
# =============================================================================
def load_indian_data():
    """Load and clean the Indian startups CSV."""
    idf = pd.read_csv("indian_startups.csv", encoding="utf-8-sig")

    # Parse amounts: strip commas and convert to float
    def parse_amount(x):
        try:
            return float(str(x).replace(",", ""))
        except (ValueError, TypeError):
            return 0.0

    idf["Amount_USD"] = idf["Amount in USD"].apply(parse_amount)

    # Extract year from date column (dd/mm/yyyy format)
    idf["Date_Parsed"] = pd.to_datetime(
        idf["Date dd/mm/yyyy"], format="%d/%m/%Y", errors="coerce"
    )
    idf["Year"] = idf["Date_Parsed"].dt.year

    # Clean industry names — group similar ones
    industry_map = {
        "eCommerce": "E-Commerce",
        "ECommerce": "E-Commerce",
        "E-commerce": "E-Commerce",
        "Consumer Internet": "Consumer Internet",
        "Technology": "Technology",
        "Healthcare": "Healthcare",
        "Finance": "Finance",
        "FinTech": "FinTech",
        "Logistics": "Logistics",
        "Education": "Education",
        "E-Tech": "EdTech",
        "Ed-Tech": "EdTech",
    }
    idf["Industry_Clean"] = idf["Industry Vertical"].map(industry_map).fillna(idf["Industry Vertical"])

    return idf

indian_df = load_indian_data()


# =============================================================================
# PAGE ROUTES — Existing (enhanced) + New
# =============================================================================

@app.route("/")
def home():
    """Dashboard home page with KPIs, charts data, and top startups."""
    # Original KPIs (preserved)
    total_funding = df["Amount Raised (USD)"].sum()
    total_funding_b = round(total_funding / 1e9, 2)
    total_startups = df["Startup Name"].nunique()
    top_country = df.groupby("Country")["Amount Raised (USD)"].sum().idxmax()

    # Additional KPIs
    avg_funding = round(df["Amount Raised (USD)"].mean() / 1e6, 2)  # in millions
    total_countries = df["Country"].nunique()

    # Mini trend data (for home page chart)
    yearly = df.groupby("Year")["Amount Raised (USD)"].sum()
    if 2026 in yearly.index:
        yearly = yearly.drop(2026)
    trend_years = yearly.index.tolist()
    trend_funding = yearly.values.tolist()

    # Sector distribution (for doughnut chart)
    sector_dist = df.groupby("Industry")["Amount Raised (USD)"].sum().sort_values(ascending=False)
    sector_labels = sector_dist.index.tolist()
    sector_values = sector_dist.values.tolist()

    # Top 10 startups by funding
    top_startups = (
        df.sort_values("Amount Raised (USD)", ascending=False)
        .head(10)[["Startup Name", "Industry", "Country", "Funding Stage", "Amount Raised (USD)"]]
        .to_dict("records")
    )

    return render_template(
        "index.html",
        page="dashboard",
        total_funding=total_funding_b,
        total_startups=total_startups,
        top_country=top_country,
        avg_funding=avg_funding,
        total_countries=total_countries,
        trend_years=trend_years,
        trend_funding=trend_funding,
        sector_labels=sector_labels,
        sector_values=sector_values,
        top_startups=top_startups,
    )


@app.route("/trends")
def trends():
    """Funding trends page with year-wise line chart."""
    df_copy = df.copy()
    yearly = df_copy.groupby("Year")["Amount Raised (USD)"].sum()
    if 2026 in yearly.index:
        yearly = yearly.drop(2026)

    years = yearly.index.tolist()
    funding = yearly.values.tolist()

    # Filter options
    countries = sorted(df["Country"].unique().tolist())
    all_years = sorted(df["Year"].unique().tolist())
    if 2026 in all_years:
        all_years.remove(2026)

    return render_template(
        "trends.html",
        page="trends",
        years=years,
        funding=funding,
        countries=countries,
        all_years=all_years,
    )


@app.route("/sector")
def sector():
    """Sector analysis page with bar chart."""
    sector_data = df.groupby("Industry")["Amount Raised (USD)"].sum().sort_values(ascending=False)

    labels = sector_data.index.tolist()
    values = sector_data.values.tolist()

    # Filter options
    countries = sorted(df["Country"].unique().tolist())

    return render_template(
        "sector.html",
        page="sectors",
        labels=labels,
        values=values,
        countries=countries,
    )


@app.route("/country")
def country():
    """Country analysis page with bar chart."""
    country_data = (
        df.groupby("Country")["Amount Raised (USD)"]
        .sum()
        .sort_values(ascending=False)
        .head(10)
    )

    labels = country_data.index.tolist()
    values = country_data.values.tolist()

    # Filter options
    industries = sorted(df["Industry"].unique().tolist())

    return render_template(
        "country.html",
        page="countries",
        labels=labels,
        values=values,
        industries=industries,
    )


@app.route("/india")
def india():
    """India analysis page with Indian startup data."""
    idf = indian_df

    # KPIs
    total_indian_funding = idf["Amount_USD"].sum()
    total_indian_funding_m = round(total_indian_funding / 1e6, 2)
    total_indian_startups = idf["Startup Name"].nunique()
    top_city = idf.groupby("City  Location")["Amount_USD"].sum().idxmax()
    top_sector = idf.groupby("Industry_Clean")["Amount_USD"].sum().idxmax()

    # Year-wise Indian funding
    india_yearly = idf.groupby("Year")["Amount_USD"].sum().sort_index()
    india_years = [int(y) for y in india_yearly.index.dropna().tolist()]
    india_funding = india_yearly.values.tolist()

    # Top 10 Indian sectors
    india_sectors = idf.groupby("Industry_Clean")["Amount_USD"].sum().sort_values(ascending=False).head(10)
    india_sector_labels = india_sectors.index.tolist()
    india_sector_values = india_sectors.values.tolist()

    # Global vs India comparison — align years
    global_yearly = df.groupby("Year")["Amount Raised (USD)"].sum()
    if 2026 in global_yearly.index:
        global_yearly = global_yearly.drop(2026)

    # Find overlapping years
    common_years = sorted(set(global_yearly.index.astype(int)) & set(india_yearly.index.dropna().astype(int)))
    compare_years = [int(y) for y in common_years]
    compare_global = [float(global_yearly.get(y, 0)) for y in common_years]
    compare_india = [float(india_yearly.get(y, 0)) for y in common_years]

    return render_template(
        "india.html",
        page="india",
        total_indian_funding=total_indian_funding_m,
        total_indian_startups=total_indian_startups,
        top_city=top_city,
        top_sector=top_sector,
        india_years=india_years,
        india_funding=india_funding,
        india_sector_labels=india_sector_labels,
        india_sector_values=india_sector_values,
        compare_years=compare_years,
        compare_global=compare_global,
        compare_india=compare_india,
    )


@app.route("/search")
def search_page():
    """Search page — renders the search UI."""
    return render_template("search.html", page="search")


# =============================================================================
# API ROUTES — JSON endpoints for dynamic frontend updates
# =============================================================================

@app.route("/api/trends")
def api_trends():
    """Filtered funding trends. Query params: country, year."""
    filtered = df.copy()
    country_filter = request.args.get("country", "all")
    if country_filter != "all":
        filtered = filtered[filtered["Country"] == country_filter]

    yearly = filtered.groupby("Year")["Amount Raised (USD)"].sum()
    if 2026 in yearly.index:
        yearly = yearly.drop(2026)

    return jsonify({
        "years": yearly.index.tolist(),
        "funding": yearly.values.tolist(),
    })


@app.route("/api/sectors")
def api_sectors():
    """Filtered sector data. Query params: country."""
    filtered = df.copy()
    country_filter = request.args.get("country", "all")
    if country_filter != "all":
        filtered = filtered[filtered["Country"] == country_filter]

    sector_data = (
        filtered.groupby("Industry")["Amount Raised (USD)"]
        .sum()
        .sort_values(ascending=False)
    )

    return jsonify({
        "labels": sector_data.index.tolist(),
        "values": sector_data.values.tolist(),
    })


@app.route("/api/countries")
def api_countries():
    """Filtered country data. Query params: industry."""
    filtered = df.copy()
    industry_filter = request.args.get("industry", "all")
    if industry_filter != "all":
        filtered = filtered[filtered["Industry"] == industry_filter]

    country_data = (
        filtered.groupby("Country")["Amount Raised (USD)"]
        .sum()
        .sort_values(ascending=False)
        .head(10)
    )

    return jsonify({
        "labels": country_data.index.tolist(),
        "values": country_data.values.tolist(),
    })


@app.route("/api/search")
def api_search():
    """Search startups by name (partial, case-insensitive). Query param: name."""
    query = request.args.get("name", "").strip()
    if not query:
        return jsonify({"results": []})

    # Search in global dataset
    mask = df["Startup Name"].str.contains(query, case=False, na=False)
    results = (
        df[mask]
        .head(20)[["Startup Name", "Industry", "Country", "Funding Stage", "Amount Raised (USD)"]]
        .to_dict("records")
    )

    # Also search in Indian dataset
    mask_india = indian_df["Startup Name"].str.contains(query, case=False, na=False)
    india_results = indian_df[mask_india].head(10)
    for _, row in india_results.iterrows():
        results.append({
            "Startup Name": row["Startup Name"],
            "Industry": row["Industry_Clean"],
            "Country": "India",
            "Funding Stage": row.get("InvestmentnType", "N/A"),
            "Amount Raised (USD)": row["Amount_USD"],
        })

    # Deduplicate by name (keep first occurrence)
    seen = set()
    unique_results = []
    for r in results:
        name = r["Startup Name"]
        if name not in seen:
            seen.add(name)
            unique_results.append(r)

    return jsonify({"results": unique_results[:20]})


@app.route("/api/top-startups")
def api_top_startups():
    """Top 10 startups by funding amount."""
    top = (
        df.sort_values("Amount Raised (USD)", ascending=False)
        .head(10)[["Startup Name", "Industry", "Country", "Funding Stage", "Amount Raised (USD)"]]
        .to_dict("records")
    )
    return jsonify({"startups": top})


@app.route("/api/india/trends")
def api_india_trends():
    """Indian startups year-wise funding trends."""
    yearly = indian_df.groupby("Year")["Amount_USD"].sum().sort_index()
    return jsonify({
        "years": [int(y) for y in yearly.index.dropna().tolist()],
        "funding": yearly.values.tolist(),
    })


@app.route("/api/india/sectors")
def api_india_sectors():
    """Top Indian sectors by funding."""
    sectors = (
        indian_df.groupby("Industry_Clean")["Amount_USD"]
        .sum()
        .sort_values(ascending=False)
        .head(10)
    )
    return jsonify({
        "labels": sectors.index.tolist(),
        "values": sectors.values.tolist(),
    })


@app.route("/api/comparison")
def api_comparison():
    """Global vs India year-wise funding comparison."""
    global_yearly = df.groupby("Year")["Amount Raised (USD)"].sum()
    if 2026 in global_yearly.index:
        global_yearly = global_yearly.drop(2026)

    india_yearly = indian_df.groupby("Year")["Amount_USD"].sum().sort_index()

    common_years = sorted(
        set(global_yearly.index.astype(int)) & set(india_yearly.index.dropna().astype(int))
    )

    return jsonify({
        "years": [int(y) for y in common_years],
        "global_funding": [float(global_yearly.get(y, 0)) for y in common_years],
        "india_funding": [float(india_yearly.get(y, 0)) for y in common_years],
    })


@app.route("/api/filters")
def api_filters():
    """Available filter options for dropdowns."""
    years = sorted(df["Year"].unique().tolist())
    if 2026 in years:
        years.remove(2026)

    return jsonify({
        "countries": sorted(df["Country"].unique().tolist()),
        "industries": sorted(df["Industry"].unique().tolist()),
        "years": years,
    })


# =============================================================================
# RUN SERVER
# =============================================================================
if __name__ == "__main__":
    app.run(debug=True)