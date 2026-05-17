package com.charity.validation;

import java.util.Set;

/**
 * Recognised Nairobi County wards and sub-county names.
 * Add entries as the platform expands to other counties.
 */
public final class WardConstants {

    private WardConstants() {}

    public static final Set<String> VALID_WARDS = Set.of(
        // ── Sub-county / constituency names (colloquial usage) ──────────────
        "Westlands", "Kasarani", "Roysambu", "Ruaraka",
        "Embakasi East", "Embakasi West", "Embakasi Central", "Embakasi North", "Embakasi South",
        "Makadara", "Kamukunji", "Starehe", "Mathare", "Langata",
        "Dagoretti North", "Dagoretti South", "Kibra",

        // ── Westlands ────────────────────────────────────────────────────────
        "Kitisuru", "Parklands", "Highridge", "Karura", "Kangemi", "Mountain View",

        // ── Kasarani ─────────────────────────────────────────────────────────
        "Clay City", "Mwiki", "Njiru", "Ruai",

        // ── Roysambu ─────────────────────────────────────────────────────────
        "Githurai", "Kahawa West", "Zimmerman", "Kahawa",

        // ── Ruaraka ──────────────────────────────────────────────────────────
        "Baba Dogo", "Utalii", "Mathare North", "Lucky Summer",

        // ── Embakasi East ────────────────────────────────────────────────────
        "Utawala", "Mihango", "Embakasi", "Lower Savanna", "Upper Savanna",

        // ── Embakasi West ────────────────────────────────────────────────────
        "Umoja I", "Umoja II", "Mowlem", "Kariobangi South",

        // ── Embakasi Central ─────────────────────────────────────────────────
        "Kayole North", "Kayole Central", "Kayole South", "Komarock",

        // ── Embakasi North ───────────────────────────────────────────────────
        "Kariobangi North", "Dandora Area I", "Dandora Area II",
        "Dandora Area III", "Dandora Area IV",

        // ── Embakasi South ───────────────────────────────────────────────────
        "Imara Daima", "Kwa Njenga", "Kware", "Pipeline",

        // ── Makadara ─────────────────────────────────────────────────────────
        "Maringo", "Viwandani", "Harambee", "Makongeni",

        // ── Kamukunji ────────────────────────────────────────────────────────
        "Pumwani", "Eastleigh North", "Eastleigh South", "Airbase", "California",

        // ── Starehe ──────────────────────────────────────────────────────────
        "Hospital", "Pangani", "Ngara", "Ziwani", "Landimawe", "Nairobi South",

        // ── Mathare ──────────────────────────────────────────────────────────
        "Mabatini", "Huruma", "Ngei", "Mlango Kubwa", "Kiamaiko",

        // ── Langata ──────────────────────────────────────────────────────────
        "Karen", "Nairobi West", "Mugumo-ini", "South C", "Nyayo Highrise",

        // ── Dagoretti North ──────────────────────────────────────────────────
        "Kilimani", "Kawangware", "Gatina", "Kileleshwa", "Kabiro",

        // ── Dagoretti South ──────────────────────────────────────────────────
        "Mutu-ini", "Ngando", "Riruta", "Waithaka",

        // ── Kibra ────────────────────────────────────────────────────────────
        "Laini Saba", "Lindi", "Makina", "Woodley", "Sarang'ombe"
    );
}
