import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PLANS, FAQS } from '../data/pricing.js'
import styles from './PricingPage.module.css'

export default function PricingPage() {
  const [billing, setBilling] = useState('monthly') // monthly | yearly
  const [openFaq, setOpenFaq] = useState(null)

  function getPrice(plan) {
    return billing === 'yearly' ? Math.round(plan.price * 0.8) : plan.price
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.eyebrow}>Transparent & fair</div>
        <h1 className={styles.title}>Unsere Tarife</h1>
        <p className={styles.subtitle}>Kein Jahresvertrag. Monatlich kündbar. Für jeden das passende Paket.</p>

        <div className={styles.billingSwitch}>
          <button
            className={`${styles.switchBtn} ${billing === 'monthly' ? styles.switchBtnActive : ''}`}
            onClick={() => setBilling('monthly')}
          >
            Monatlich
          </button>
          <button
            className={`${styles.switchBtn} ${billing === 'yearly' ? styles.switchBtnActive : ''}`}
            onClick={() => setBilling('yearly')}
          >
            Jährlich
            <span className={styles.saveBadge}>–20%</span>
          </button>
        </div>
      </div>

      {/* Plans */}
      <div className={styles.plansGrid}>
        {PLANS.map(plan => (
          <div
            key={plan.id}
            className={`${styles.planCard} ${plan.highlight ? styles.planCardHighlight : ''}`}
            style={{ '--pc': plan.color }}
          >
            {plan.badge && <div className={styles.planBadge}>{plan.badge}</div>}
            <div className={styles.planName}>{plan.name}</div>
            <div className={styles.planTagline}>{plan.tagline}</div>
            <div className={styles.planPriceRow}>
              <span className={styles.planPrice}>{getPrice(plan)} €</span>
              <span className={styles.planPeriod}>/ {plan.period}</span>
            </div>
            {billing === 'yearly' && (
              <div className={styles.yearlyNote}>
                Statt {plan.price} € · Du sparst {plan.price * 12 - getPrice(plan) * 12} €/Jahr
              </div>
            )}
            <div className={styles.planDivider} />
            <ul className={styles.featureList}>
              {plan.features.map(f => (
                <li key={f.text} className={`${styles.feature} ${!f.included ? styles.featureOff : ''}`}>
                  <span className={styles.featureIcon}>{f.included ? '✓' : '×'}</span>
                  {f.text}
                </li>
              ))}
            </ul>
            <Link
              to="/buchen"
              className={`${styles.planCta} ${plan.highlight ? styles.planCtaHighlight : ''}`}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>

      {/* Trust bar */}
      <div className={styles.trustBar}>
        {[
          { icon: '🔒', text: 'SSL-verschlüsselt' },
          { icon: '📅', text: 'Monatlich kündbar' },
          { icon: '💳', text: 'SEPA & Kreditkarte' },
          { icon: '🎁', text: '1. Monat bei Jahrestarif gratis' },
        ].map(item => (
          <div key={item.text} className={styles.trustItem}>
            <span>{item.icon}</span>
            <span>{item.text}</span>
          </div>
        ))}
      </div>

      {/* Compare table */}
      <div className={styles.compareSection}>
        <div className={styles.eyebrow}>Im Überblick</div>
        <h2 className={styles.compareTitle}>Tarife vergleichen</h2>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.thFeature}>Leistung</th>
                {PLANS.map(p => (
                  <th key={p.id} className={`${styles.th} ${p.highlight ? styles.thHighlight : ''}`} style={{ '--pc': p.color }}>
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PLANS[0].features.map((f, i) => (
                <tr key={f.text} className={styles.tr}>
                  <td className={styles.tdFeature}>{f.text}</td>
                  {PLANS.map(p => (
                    <td key={p.id} className={`${styles.td} ${p.highlight ? styles.tdHighlight : ''}`}>
                      {p.features[i].included
                        ? <span className={styles.checkYes}>✓</span>
                        : <span className={styles.checkNo}>—</span>
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ */}
      <div className={styles.faqSection}>
        <div className={styles.eyebrow}>Häufige Fragen</div>
        <h2 className={styles.faqTitle}>FAQ</h2>
        <div className={styles.faqList}>
          {FAQS.map((faq, i) => (
            <div key={i} className={`${styles.faqItem} ${openFaq === i ? styles.faqItemOpen : ''}`}>
              <button className={styles.faqQuestion} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <span>{faq.q}</span>
                <span className={styles.faqToggle}>{openFaq === i ? '−' : '+'}</span>
              </button>
              {openFaq === i && (
                <div className={styles.faqAnswer}>{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
